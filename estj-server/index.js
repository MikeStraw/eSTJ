const envResult  = require('dotenv').config()
const apiServer  = require('./apiServer')
const argv       = require('minimist')(process.argv.slice(2))  //[0] = node.exe, [1] =.../index.js
const debug      = require('debug')('estj-server')
const fs         = require('fs')
const meetDbo    = require('./services/SwimMeetDbo')
const meetUpdate = require('./services/fileUpdate')
const mongoose   = require('mongoose')

const meetIdMap = new Map()   // Maps meet name + date --> meet ID

/**
 * Runs the eSTJ server.
 * @returns {Promise<>}
 */
function main()
{
    return new Promise( (resolve, reject) => {
        const pgmOptions = checkCmdLineArgs(argv)
        if (pgmOptions.help) {
            usage()
            resolve()
        }
        if (pgmOptions.errors.length > 0) {
            usage()
            reject(pgmOptions.errors)
        }

        if (envResult.error) {
            debug(`Warning:  error found in the .env file: ${envResult.error}`)
        }
        process.on('unhandledRejection', error => { reject(error) })

        const connectOpts = {
            useNewUrlParser: true,    // uses port number in DSN
            useFindAndModify: false,  // findAndModify uses MongoDB's findAndModify
            useUnifiedTopology: true
        }
        const mongoDSN =  pgmOptions.dsn ? pgmOptions.dsn : 'mongodb://localhost:27017/stj'
        debug(`using DSN: ${mongoDSN}`)

        mongoose.connect(mongoDSN, connectOpts)
            .then( async() => {
                debug('mongoose connect OK ...')
                const finished = await runProgram(pgmOptions)
                if (finished) {
                    mongoose.disconnect().then (resolve)
                }
            })
    })
}

/**
 * Check the command line arguments for valid options.
 * @param {object} argv - Object with key-value pair for each command line argument.
 * @returns {{meetFile: string, help: boolean, watchFile: string, runApiServer: boolean, errors: []}}
 */
function checkCmdLineArgs(argv)
{
    const pgmOptions = {
        dsn: '',
        errors: [],
        help: false,
        meetFile: '',
        runApiServer: false,
        watchFile: ''
    }

    debug(argv)
    if (argv.dsn && typeof(argv.dsn) === 'boolean') {
        pgmOptions.errors.push('The --dsn option requires an argument.')
    }
    if (argv.file &&  typeof(argv.file) === 'boolean') {
        pgmOptions.errors.push('The --file option requires an argument.')
    }
    if (argv.watch &&  typeof(argv.watch) === 'boolean') {
        pgmOptions.errors.push('The --watch option requires an argument.')
    }

    pgmOptions.help = argv.help
    pgmOptions.meetFile = argv.file
    pgmOptions.runApiServer = !argv.noapi
    pgmOptions.watchFile = argv.watch

    return pgmOptions
}


/**
 * Update the DB with the changes from the changed meetJsonFile.
 * @param meetJsonFile the meet JSON file with the latest updates
 * @param curJson the current representation of the meet
 * @returns {*} the representation of the updated meet as read from meetJsonFile
 */
async function handleMeetUpdate(meetJsonFile, curJson) {
    debug(`Update detected in file ${meetJsonFile}`)

    meetUpdate.createMeetBackup(meetJsonFile, curJson)

    const newJson = JSON.parse(fs.readFileSync(meetJsonFile, 'utf8'))
    const updateResult = meetUpdate.diffUpdate(curJson, newJson)
    debug(updateResult)

    if (updateResult.updateSupported === false) {
        debug.error('Unsupported update ... HELP!')
        // Really need to delete old meet and save new meet,
        // then signal clients to reload with new meet ID.
        throw 'Unsupported meet update ... exiting.'
    }
    else {
        const meetKey = `${newJson.name}:${newJson.date}`
        let   meetId  = meetIdMap.get(meetKey)
        if (! meetId) {
            meetId = await meetDbo.getMeetId(newJson.name, newJson.date)
            meetIdMap.set(meetKey, meetId)
        }

        for (let updateItem of updateResult.updateItems) {
            updateItem.meetId = meetId

            // If event # and heat # are present, replace all of the heat.entries
            // with data from the newJson object
            if (updateItem.event && updateItem.heat) {
                const newEntries = meetUpdate.getHeatEntries(newJson, updateItem)
                await meetDbo.updateHeatEntries(newEntries, updateItem)
            }
        }

    }
    return newJson
}


/**
 * Run the estj-server.
 * @param pgmOptions
 * @returns {Promise<boolean>}
 */
async function runProgram(pgmOptions)
{
    debug('Inside runProgram')
    if (pgmOptions.meetFile) {
        const meetJson = JSON.parse(fs.readFileSync(pgmOptions.meetFile, 'utf8'))
        const meetId = await meetDbo.saveToDB(meetJson)
        debug(`inserting meet file ${pgmOptions.meetFile} into DB, ID: ${meetId}`)

        const meetKey = `${meetJson.name}:${meetJson.date}`
        meetIdMap.set(meetKey, meetId)
    }

    if (pgmOptions.watchFile) {
        debug(`watching file ${pgmOptions.watchFile}`)
        watchFile(pgmOptions.watchFile)
    }

    if (pgmOptions.runApiServer) {
        debug('running API server ...')
        apiServer.startServer(process.env.API_PORT)
    }

    // we're finished if we aren't running express or watching the meet file
    const finishedProcessing = !(pgmOptions.runApiServer || pgmOptions.watchFile)

    debug(`leaving runProgram with finished = ${finishedProcessing}`)
    return (finishedProcessing)
}


/**
 * Logs a usage message to the console.
 */
function usage()
{
    const help = '\nUSAGE: node index.js [--dsn mongo-dsn] [--file meet-file] [--noapi] [--watch meet-file]\n'    +
        'Where:  \n' +
        '    --help            --> prints this help message.\n' +
        '    --dsn  mongo-dsn  --> the MongoDB connection data source name (DSN).\n' +
        '                          If not supplied a default DSN is used.\n' +
        '    --file meet-file  --> insert the JSON formatted meet data file into the Mongo DB.\n' +
        '    --noapi           --> do not start the node API server to service eSTJ-client requests.\n' +
        '    --watch meet-file --> watch the JSON formatted meet data file for updates and\n' +
        '                          send meet update events to the connected clients.\n'

    console.log(help)
}

/**
 * Watches the JSON file representation of the meet for changes.  When an update
 * occurs, perform a diff and send meet update events to the listening clients.
 * @param meetJsonFile
 */
function watchFile(meetJsonFile)
{
    if (! fs.existsSync(meetJsonFile)) {
        debug.error(`ERROR: JSON file ${meetJsonFile} does not exist.`)
        return
    }
    let curJson = JSON.parse(fs.readFileSync(meetJsonFile, 'utf8'))

    // Need to debounce so that we don't get multiple messages for a single update
    let fsWait = false
    fs.watch(meetJsonFile, (event, filename) => {
        if (filename) {
            if (fsWait) { /* triggered again w/in 100 ms --> do nothing */ }
            else {
                fsWait = true
                setTimeout(() => {
                    curJson = handleMeetUpdate(meetJsonFile, curJson)
                    fsWait = false
                }, 100)
            }
        }
    })

}

/**
 * The JS executions starts here
 */
main().then( () => {
    debug('eSTJ Server stopping, exit code = 0 ...')
    process.exit(0)
}).catch( (err) => {
    console.error('FAILURE: ' + err)
    process.exit(1)
})

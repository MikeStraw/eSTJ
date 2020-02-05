const apiServer = require('./apiServer')
const argv      = require('minimist')(process.argv.slice(2))  //[0] = node.exe, [1] =.../index.js
const debug     = require('debug')('estj-server')
const fs        = require('fs')
const meetDbo   = require('./services/SwimMeetDbo')
const mongoose  = require('mongoose')

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

    if (argv.watch && ! argv.file) {
        pgmOptions.errors.push('If using --watch, the --file option must also be used.')
    }

    if (argv.noapi && ! argv.file) {
        pgmOptions.errors.push('If using --noapi, the --file option must be used.')
    }

    pgmOptions.help = argv.help
    pgmOptions.meetFile = argv.file
    pgmOptions.runApiServer = !argv.noapi
    pgmOptions.watchFile = argv.watch

    return pgmOptions
}

async function runProgram(pgmOptions)
{
    debug('Inside runProgram')
    if (pgmOptions.meetFile) {
        const meetJson = JSON.parse(fs.readFileSync(pgmOptions.meetFile, 'utf8'))
        await meetDbo.saveToDB(meetJson)
    }

    if (pgmOptions.watchFile) {
        debug(`watching file ${pgmOptions.watchFile}`)
        //watchFile(pgmOptions.meetFile)
    }

    if (pgmOptions.runApiServer) {
        debug('running API server ...')
        apiServer.startServer()
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
    const help = '\nUSAGE: node index.js [--dsn mongo-dsn] [--file meet-file] [--noapi] [--watch]\n'    +
        'Where:  \n' +
        '    --help           --> prints this help message.\n' +
        '    --dsn  mongo-dsn --> the MongoDB connection data source name (DSN).\n' +
        '                         If not supplied a default DSN is used.\n' +
        '    --file meet-file --> insert the JSON formatted meet data file into the Mongo DB.\n' +
        '    --noapi          --> do not start the node API server to service eSTJ-client requests.\n' +
        '    --watch          --> watch the meet information file for updates.\n'

    console.log(help)
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
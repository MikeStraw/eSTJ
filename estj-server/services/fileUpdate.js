/**
 * fileUpdate module
 * @module services/fileUpdate
 * This module provides the services to handle updates to the swim meet JSON file.
 * Services include diffing different versions of the meet json object,
 * backing up the meet json file and extracting data from the meet json object.
 */
const debug  = require('debug')('estj-server')
const fs     = require('fs')
const diff   = require('deep-diff').diff

let   MeetFileNumber = 1
const MaxMeetFiles   = 20

class UpdateItem {
    constructor(field) {
        this.abortUpdate = false   // true --> process new JSON file as whole (not as updates)
        this.event = null          // event # associated with this update
        this.field = field         // JSON field causing the update
        this.heat = null           // heat # associated with this update
        this.ignoreUpdate = false  // true --> nothing important was updated
        this.lane = null           // lane number associated with this update
        this.session = null        // session number associated with this update
    }
}

/**
 * The return type from processUpdate
 */
class UpdateResponse {
    constructor (updateItems, updateSupported = true) {
        this.updateItems = updateItems           // array of UpdateItems
        this.updateSupported = updateSupported   // false means reprocess entire JSON, not updates
    }
}

/**
 * Coalesce multiple event and heat update items into single update items.  In particular,
 * multiple entry type updates for a particular heat are converted into a single heat update
 * and multiple entry add/deletes are converted into a single event update.
 * @param {UpdateItem[]} updateItems the incoming list of updates
 * @returns {UpdateItem[]} the coalesced list of updates
 */
function coalesceUpdates(updateItems)
{
    let eventMap = new Map()
    let heatMap = new Map()

    updateItems.forEach( updateItem => {
        if (updateItem.heat) {
            const key = `:${updateItem.session}:${updateItem.event}:${updateItem.heat}:`
            if (heatMap.has(key) === false) {
                heatMap.set(key, updateItem)
            }
        }
        else if (updateItem.event) {
            const key = `:${updateItem.session}:${updateItem.event}:`
            if (eventMap.has(key) === false) {
                eventMap.set(key, updateItem)
            }
        }
    })

    debug(`CoalesceUpdates ... eventMap.size=${eventMap.size}, heatMap.size=${heatMap.size}`)
    return Array.from(heatMap.values()).concat(Array.from(eventMap.values()))
}


/**
 * Convert the deep-diff path array ('level-1', idx, 'level-2', idx, ... , 'field-name')
 * into a javascript object {level-1: idx, level-2: idx, ... , field: 'field-name'}
 * @param {String} path the deep-diff path array
 * @returns {{Object}}
 */
function diffPathToObj(path)
{
    let i = 0
    let pathDescriptor = {}

    while (i < path.length-1) {
        pathDescriptor[path[i]] = path[i+1]
        i = i + 2
    }
    pathDescriptor['field'] = path[i]

    return pathDescriptor
}


/**
 * Convert the deep-diff difference item into an updateItem
 * @param {Object} curJson the current JSON representation of the meet
 * @param {Object} diffItem the deep-diff difference item
 * @returns {UpdateItem} information about the data that was updated
 */
function diffToUpdateItem(curJson, diffItem)
{
    const diffObj = diffPathToObj(diffItem.path)
    let updateItem = new UpdateItem(diffObj.field)

    switch(diffObj.field) {
    case 'final':  // updated final time for an entry
    case 'heat':   // updated heat info for an entry (move entry from one heat to another)
    case 'lane':   // updated lane info for an entry (move entry from one lane to another)
    case 'seed':   // updated seed time for an entry
        //debug('Switch case final, heat, lane, seed')
        updateItem = updateEntry(curJson, diffObj)
        break

    case 'entries':  // add/delete an entry or entire heat
        //debug('Switch case entries')
        updateItem = updateEntries(curJson, diffObj)
        break

    case 'events':  // add/delete an event **** NOT A SUPPORTED UPDATE ***
        // need to ignore the entire update as add/delete event causes enormous changes.
        //debug('Switch case events')
        updateItem.abortUpdate = true
        break

    default:
        //debug('Switch default ... disregard change')
        updateItem.ignoreUpdate = true
    }

    return updateItem
}


// Convenience functions to find json data in an array by index or number.  Improves readability.
function findEntryByIndex(event, idx) { return event.entries[idx] }
function findEntriesByHeatNumber(event, heatNum) { return event.entries.filter(entry => entry.heat === heatNum) }

function findEventByIndex(session, idx) { return session.events[idx] }
function findEventByNumber(session, num) { return session.events.find(event => event.number === num) }

function findSessionByIndex(meetJson, idx) { return meetJson.sessions[idx] }
function findSessionByNumber(meetJson, num) { return meetJson.sessions.find(session => session.number === num) }


/**
 * Get the next name of the next backup file for this meet file.
 * @param {string} meetFileSpec the full path of the JSON meet file
 * @returns {string} the full path name of the backup file
 */
function getBackupFileSpec(meetFileSpec)
{
    const fileSpec = `${meetFileSpec.slice(0, -5)}.${MeetFileNumber++}.json`

    if (MeetFileNumber > MaxMeetFiles) {
        MeetFileNumber = 1
    }

    return fileSpec
}


/**
 * Save the json data to a file
 * @param {string} fileSpec full path tot the file
 * @param {Object} jsonData the JSON meet data
 */
function saveJsonToFile(fileSpec, jsonData)
{
    fs.writeFile(fileSpec, JSON.stringify(jsonData, null, 2), function(err) {
        if (err) {
            debug.error(err)
        }
    })
}


/**
 * Update an existing entry.
 * Get the session #, event #, heat # and lane # info associated with final-time update
 * @param {Object} meetJson the current (old) version of the json meet representation
 * @param {Object} diffObj identifies a single field that was changed in an entry
 * @returns {UpdateItem}
 */
function updateEntry(meetJson, diffObj)
{
    const session = findSessionByIndex(meetJson, diffObj.sessions)
    const event   = findEventByIndex(session, diffObj.events)
    const entry   = findEntryByIndex(event, diffObj.entries)

    let updateItem = new UpdateItem(diffObj.field)
    updateItem.event = event.number
    updateItem.heat = entry.heat
    updateItem.lane = entry.lane
    updateItem.session = session.number

    return updateItem
}


/**
 * Add or delete an entry in the array of entries.
 * Get the session # and event # info associated with the entry add/delete
 * @param {Object} meetJson the current (old) version of the json meet representation
 * @param {Object} diffObj identifies a single entry that was changed in the array of entries
 * @returns {UpdateItem}
 */
function updateEntries(meetJson, diffObj)
{
    const session = findSessionByIndex(meetJson, diffObj.sessions)
    const event   = findEventByIndex(session, diffObj.events)

    let updateItem = new UpdateItem(diffObj.field)
    updateItem.event = event.number
    updateItem.session = session.number

    return updateItem
}

module.exports = {

    UpdateResponse: UpdateResponse,
    UpdateItem: UpdateItem,

    /**
     * Create a backup file based on the fileSpec and json data.
     * @param {string} fileSpec the name of the meet JSON file that was just updated
     * @param {Object} json the current representation of the meet
     */
    createMeetBackup: function(fileSpec, json) {
        const meetBackupFile = getBackupFileSpec(fileSpec)

        saveJsonToFile(meetBackupFile, json)
        debug(`Create backup file ${meetBackupFile} from ${fileSpec}.`)
    },

    /**
     * Perform a diff between the current and new meet representations
     * @param {Object} curJson the current representation of the meet
     * @param {Object} newJson the new representation of the meet
     * @returns {UpdateResponse} a list of update items to process
     */
    diffUpdate: function(curJson, newJson) {
        const diffArray = diff(curJson, newJson)
        if (! diffArray) {
            return new UpdateResponse([], true)
        }

        // collect all the updates in the diff
        const updateItems = []
        let   updateSupported = true

        for (let i=0; i<diffArray.length; i++) {
            const item = diffArray[i]
            const updateItem = diffToUpdateItem(curJson, item)

            // checking abortUpdate here and breaking the loop can save
            // the trouble of processing hundreds of updateItems
            if (updateItem.abortUpdate) {
                debug('update type not supported ... aborting this update')
                updateSupported = false
                break
            }
            if (updateItem.ignoreUpdate === false) {
                updateItems.push(updateItem)
            }
        }

        // Coalesce multiple updates for an event or heat so that the
        // event + heat or just the event is identified as changed.
        const updateList = coalesceUpdates(updateItems)

        return new UpdateResponse(updateList, updateSupported)
    },

    /**
     * Return the array of entries for a particular heat in the meet json.
     * @param {Object} meetJson representation of the meet in json format
     * @param {UpdateItem} queryObj object specifying the session, event and heat number
     * @return {Object[]} array
     */
    getHeatEntries: function(meetJson, queryObj) {
        const session = findSessionByNumber(meetJson, queryObj.session)
        const event   = findEventByNumber(session, queryObj.event)
        const entries = findEntriesByHeatNumber(event, queryObj.heat)
        return (entries)
    }
}

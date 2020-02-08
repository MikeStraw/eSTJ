/**
 * SwimMeetDbo module
 * @module services/SwimMeetDbo
 * This module provides a method to save the JSON representation of the swim meet,
 * as produced by mm_to_json, into the Mongo DB.
 * This module depends on an open Mongoose connection to the Mongo DB.
 */
const debug  = require('debug')('estj-server')
const Event  = require('../models/Event')
const Heat   = require('../models/Heat')
const Meet   = require('../models/Meet')
const moment = require('moment-timezone')

/**
 * Extract the events from each session of the meet.
 * @param {Object} meetJson - The data for the entire swim meet.  This object is modified by this method.
 * @returns [Event] - Array of Event objects and their entries associated with each session of the meet.
 */
function extractEventsFromMeetSessions(meetJson) {
    const events = []

    meetJson.sessions.forEach(function(session) {
        session.events.forEach(function(event) {
            event.session_num = session.number
            events.push(event)
        })
        delete session.events
    })

    return events
}

/**
 *
 * @param {Object} eventJson - An event with its associated entries.  eventJson is modified by this method.
 * @returns {[]} - a sorted array (based on heat number) of heats with each heat's entries sorted by lane.
 */
function extractHeatsFromEvent(eventJson) {
    const eventEntries = eventJson.entries
    const heatMap      = new Map()
    const heats        = []

    eventEntries.forEach(function(entry) {
        let   heat = {}
        const heatNumber = entry.heat

        if (heatMap.has(heatNumber)) {
            heat = heatMap.get(heatNumber)
        }
        else {
            heat.entries  = []
            heat.number   = heatNumber
            heatMap.set(heatNumber, heat)
        }
        const heatEntry = makeHeatEntryFromEventEntry(entry)
        heat.entries.push(heatEntry)
    })

    // sort the heat numbers and build the heats
    const heatNumbers = Array.from(heatMap.keys())
    heatNumbers.sort( (a, b) => a - b )   //  force number (not string) comparison
    heatNumbers.forEach(function(heatNum) {
        // sort the heat entries by lane
        const heat = heatMap.get(heatNum)
        heat.entries.sort( (a, b) => a.lane - b.lane )

        heats.push(heat)
    })

    return heats
}

/**
 *
 * @param {Object} eventEntry - An event entry JSON object from the event.entries array
 * @returns {Object} - an individual HeatEntry object containing a deep copy of the event entry data
 */
function makeHeatEntryFromEventEntry(eventEntry) {
    const heatEntry = JSON.parse(JSON.stringify(eventEntry))
    delete heatEntry.heat     // the heat # is not part of the heat entries themselves
    return heatEntry
}


/**
 * Save the Event data to the Mongo DB.
 * @param {Object} eventJson - Saves the event into the mongo DB.  eventJson is modified by this method.
 * @param {String} meetId - The mongo ID of the meet.
 * @returns {Promise<Document>} - The promise resolves to the saved mongoose Event document.
 */
function saveEventData(eventJson, meetId)
{
    // We don't want to save the entries with the event data
    const event = Object.assign({}, eventJson)
    event.meet_id = meetId
    delete event.entries

    const queryObj   = {'meet_id': event.meet_id, 'number': event.number, 'session_num': event.session_num}
    const updateOpts = {'new': true, 'upsert': true, 'runValidators': true}

    return Event.findOneAndUpdate(queryObj, event, updateOpts).exec()
}

/**
 *
 * @param {Object} heatJson - The heat and it's entries
 * @returns {Promise<Document>} - The promise resolves to the saved mongoose Heat document.
 */
function saveHeatData(heatJson) {
    const queryObj   = {'event_id': heatJson.event_id, 'number': heatJson.number}
    const updateOpts = {'new': true, 'upsert': true, 'runValidators': true}

    return Heat.findOneAndUpdate(queryObj, heatJson, updateOpts).exec()
}


/**
 * Save the meet and session data of the swim meet JSON object to the Mongo DB.
 * @param {Object} meetJson - The JSON representation of the swim meet as produced by mm_to_json.
 * meetJson is modified by this method.
 * @returns {Promise<Document>} - The promise resolves to the saved mongoose Meet document.
 */
function saveMeetAndSessions(meetJson) {
    // TODO: get local time zone
    meetJson.date = moment.tz(meetJson.date, 'America/New_York').format()

    const queryObj   = {'name': meetJson.name, 'date': meetJson.date}
    const updateOpts = {'new': true, 'upsert': true, 'runValidators': true}

    return Meet.findOneAndUpdate(queryObj, meetJson, updateOpts).exec()
}

module.exports = {
    /**
     * Save the swim meet JSON data into the DB.  The incoming meetJson object is modified during
     * this process.
     * @param {Object} meetJson - The JSON representation of the swim meet as produced by mm_to_json
     * @returns {Promise<void>}
     */
    saveToDB: async function(meetJson) {
        // Because we save the meet/session, event and entries in separate mongo collections,
        // we need to tear apart the meetJson object to get at those portions of the object.
        // We don't need an intact meetJson after this method finishes, so we extract and remove
        // the data from the meetJson rather than making a deep copy and preserving meetJson.
        const events = extractEventsFromMeetSessions(meetJson)
        const meet   = await saveMeetAndSessions(meetJson)
        const meetId = meet._id
        debug(`Saved/updated meet id: ${meetId}`)

        for (const event of events) {
            const heats = extractHeatsFromEvent(event)
            const savedEvent = await saveEventData(event, meetId)

            for (const heat of heats) {
                heat.event_id = savedEvent._id
                await saveHeatData(heat)
            }
        }
    }
}
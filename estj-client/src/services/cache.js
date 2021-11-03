/**
 * Holds the cache.js of meet, event, entry (ie heat) information
 */
const meets = []            // list of available meets and their associated sessions
const events = new Map()    // maps meet+session into a list of events.  {meetId, sessNum} --> events[]
const heats = new Map()     // maps events into a list of heats.  eventId --> heats[]

const eventKey = (meetId, sessNum) => { return `meetId:${meetId}|sessNum:${sessNum}` }

const CacheService = {

    addMeets: (newMeets) => { meets.push(...newMeets) },
    clearMeets: ()       => { meets.splice(0, meets.length) },
    getMeetById: (id)    => { return meets.find( (meet) => meet._id === id) },
    getMeets: ()         => { return meets },

    addEvents: (meetId, sessNum, newEvents) => { events.set(eventKey(meetId, sessNum), newEvents) },
    getEvents: (meetId, sessNum) => {
        const eventList = events.get(eventKey(meetId, sessNum))
        return  eventList ? eventList : []
    },

    addHeats: (eventId, newHeats) => { heats.set(eventId, newHeats) },
    getHeats: (eventId) => {
        const heatList = heats.get(eventId)
        return heatList ? heatList : []
    },
    markHeatDirty: function (meetId, sessNum, eventNum, heatNum) {
        const eventList = this.getEvents(meetId, sessNum)
        if (eventList) {
            const event = eventList.find(ev => ev.number === eventNum)
            if (event) {
                const heats = this.getHeats(event._id)
                if (heats && heats.length >= heatNum) {
                    const heat = heats[heatNum - 1]
                    heat.dirty = true
                }
            }
        }
    },
    removeHeats: function (meetId, sessNum, eventNum ) {
        const eventList = this.getEvents(meetId, sessNum)
        if (eventList) {
            const event = eventList.find(ev => ev.number === eventNum)
            if (event) {
                heats.delete(event._id)
            }
        }
    },
    updateHeatEntries: function(updatedHeat) {
        const heats = this.getHeats(updatedHeat.event_id)
        if (heats) {
            const heat = heats.find(h => h.number === updatedHeat.number)
            heat.entries = updatedHeat.entries
            delete (heat.dirty)
        }
    }
}

Object.freeze(CacheService)
export default CacheService

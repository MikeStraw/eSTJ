import apiSvc from '../../services/api'
import cacheSvc from '../../services/cache'
import sseClient from '../../services/sseClient'


/**
 * Handles a meet update sent via SSE.  The update contains an object of the form
 * {meetId:, session:, event:, heat:}, where the meetId is the Mongo meet ID,  session is the session number,
 * event is the event number and heat is the heat number.
 * @param {Object} updateItem
 */
function onSseUpdate(updateItem) {
    console.log(`meetStore::onSeeUpdate -> event=${updateItem.event}, heat=${updateItem.heat}`)
    if (updateItem.heat) {
        console.log('marking heat dirty')
        cacheSvc.markHeatDirty(updateItem.meetId, updateItem.session, updateItem.event, updateItem.heat)
        state.heatUpdate = updateItem.heat
    }
    else if (updateItem.event) {
        console.log('removing heat')
        cacheSvc.removeHeats(updateItem.meetId, updateItem.session, updateItem.event)
    }
}

const sseEmitter = sseClient.getSseEventEmitter()
sseEmitter.on('dataUpdate', onSseUpdate)

function commitError(commit, error) {
    if (error && error.response && error.response.data && error.response.data.error) {
        commit('dataRequestError', error.response.data.error)
    }
    else {
        commit('dataRequestError', { code: 1, message: 'Error: connecting to the server.'})
    }
}

function copyMeetAndSession({meetId, sessionNum} ) {
    const meet = cacheSvc.getMeetById(meetId)
    const session = findSessionByNumber(meet.sessions, sessionNum)

    const meetCopy= JSON.parse(JSON.stringify(meet))
    const sessCopy = JSON.parse(JSON.stringify(session))

    delete meetCopy.sessions
    meetCopy.session = sessCopy
    meetCopy.events = []          // add storage for event list associated with this meet+session
    meetCopy.eventIdx = -1        // current index into events[]

    return meetCopy
}

const findSessionByNumber = (sessions, sessNum) => {
    return  sessions.find( (session) => session.number === Number(sessNum))
}

const isHeatBeingViewed = (state, heat) => {
    return (state.activeEvent && state.activeEvent._id === heat.event_id && state.heatUpdate == heat.number)
}


const state = {
    activeEvent: false, // reference to the selected/viewed event
    activeMeet: false,  // copy of the selected meet & session
    heatUpdate: 0,      // heat number of a just updated heat
    loading: false,     // true when retrieving meets from DB
    loadingError: ''    // contains data retrieval error message
}

const getters = {
    hasNextEvent: state => {
        if (state.activeMeet && state.activeMeet.events)
            return (state.activeMeet.eventIdx + 1) < state.activeMeet.events.length
        else
            return false
    },
    hasPrevEvent: state => { return state.activeMeet ? state.activeMeet.eventIdx > 0 : false },
    heatUpdated: (state) => (heat) => {return (isHeatBeingViewed(state, heat))}
}

const mutations = {
    clearHeatUpdate(state) {
        state.heatUpdate = 0
    },
    dataRequested(state) {
        state.loading = true
        state.loadingError = ''
    },
    dataRequestError(state,  err) {
        state.loadingError = `${err.code}: ${err.message}`
    },
    dataRequestFinished(state) {
        state.loading = false
    },
    setActiveEvent(state, eventId) {
        const activeMeet = state.activeMeet
        if (activeMeet && activeMeet.events) {
            const idx = activeMeet.events.findIndex( event => event._id === eventId)

            if (idx !== -1) {
                state.activeEvent = activeMeet.events[idx]
            }
            activeMeet.eventIdx = idx
            state.heatUpdate = 0
        }
    },
    setActiveMeet(state, meet) {
        state.activeMeet = meet
    },
    setHeatUpdate(state, heatNum) {
        state.heatUpdate = heatNum
    }
}

const actions = {
    /**
     * Return the next event in the active event
     * @param state
     * @returns {null} - The next event or null if there is no next event
     */
    getNextEvent({state}) {
        const activeMeet = state.activeMeet
        let nextEvent = null

        if (activeMeet && activeMeet.events && activeMeet.events.length > 0) {
            if (activeMeet.eventIdx !== activeMeet.events.length - 1) {
                nextEvent = activeMeet.events[activeMeet.eventIdx + 1]
            }
        }
        return nextEvent
    },
    /**
     * Return the previous event in the active event
     * @param state
     * @returns {null}
     */
    getPrevEvent({state}) {
        const activeMeet = state.activeMeet
        let prevEvent = null

        if (activeMeet && activeMeet.events && activeMeet.events.length > 0) {
            if (activeMeet.eventIdx !== 0) {
                prevEvent = activeMeet.events[activeMeet.eventIdx - 1]
            }
        }
        return prevEvent
    },
    /**
     * Load the Event entries (ie heats) for the event identified by the payload
     * @param commit
     * @param payload - and event object with an _id field
     * @returns {Promise<[]>} - Promise resolves to an array of Heat objects
     */
    async loadEvent( {commit}, payload) {
        commit('dataRequested')

        let   heats = []
        const eventId = payload.event._id
        const cachedHeats = cacheSvc.getHeats(eventId)
        try {
            if (cachedHeats.length > 0) {
                heats = cachedHeats
                console.log(`/api/event/heats finds heats in cache, heats.length = ${heats.length}`)
            }
            else {
                const response = await apiSvc.getHeats(eventId)
                heats = response.data
                cacheSvc.addHeats(eventId, heats)
                console.log(`/api/event/heats returns with heats.length = ${heats.length}`)
            }
            commit('setActiveEvent', eventId)
        }
        catch (error) {
            commitError(commit, error)
        }

        commit('dataRequestFinished')
        return Promise.resolve(heats)
    },

    /**
     * Load the events associated with the meet and session identified in the payload.
     * Sets the active meet to the meet identified in the payload.
     * @param commit
     * @param state
     * @param payload - identifies the active meet via {meetId, sessionNum} fields
     * @returns {Promise<[]>} - The promise resolves to an array of Event objects
     */
    async loadEvents( {commit}, payload) {
        let events = []
        const meet = copyMeetAndSession(payload)
        if (!meet) {
            const err = {code: 999, message: `No meet found matching criteria ${payload}`}
            const error = { response: { data: {error: err} } }
            commitError(commit, error)

            return Promise.resolve(events)
        }
        commit('dataRequested')

        const cachedEvents = cacheSvc.getEvents(payload.meetId, payload.sessionNum)
        try {
            if (cachedEvents.length > 0) {
                events = cachedEvents
                console.log(`/api/events found events in cache, events.length = ${events.length}`)
            }
            else {
                const response = await apiSvc.getEvents(payload.meetId, payload.sessionNum)
                events = response.data
                cacheSvc.addEvents(payload.meetId, payload.sessionNum, events)
                console.log(`/api/events return with events.length = ${events.length}`)
            }
            meet.events = events
            commit('setActiveMeet', meet)
        }
        catch (error) {
            commitError(commit, error)
        }

        commit('dataRequestFinished')
        return Promise.resolve(events)
    },

    /**
     * Load the list of available meets from the DB.
     * @param commit
     * @returns {Promise<[]>} - The promise resolves to an array of Meet objects
     */
    async loadMeets( {commit} ) {
        commit('dataRequested')

        let meets = cacheSvc.getMeets()
        if (meets.length > 0) {
            console.log(`/api/meets found meets in cache, meets.length = ${meets.length}`)
        }
        else {
            try {
                const response = await apiSvc.getMeets()
                meets = response.data
                console.log(`/api/meets returns with meets.length = ${meets.length}`)
                cacheSvc.addMeets(meets)
            }
            catch(error) {
                commitError(commit, error)
            }
        }

        commit('dataRequestFinished')
        return Promise.resolve(meets)
    },
    async updateHeat( {commit}, payload ) {
        commit('dataRequested')

        let   heat = {}
        const heatId = payload.heat._id
        try {
            const response = await apiSvc.getHeat(heatId)
            heat = response.data
            console.log('/api/heat/:id returns', heat)

            cacheSvc.updateHeatEntries(heat)
            if (isHeatBeingViewed(state, heat)) {
                commit('clearHeatUpdate')
            }
        }
        catch (error) {
            commitError(commit, error)
        }

        commit('dataRequestFinished')
        return Promise.resolve(heat)
    }
}

export const meetStore = {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
}

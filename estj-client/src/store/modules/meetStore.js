import apiSvc from '../../services/api'

function commitError(commit, error) {
    if (error && error.response && error.response.data && error.response.data.error) {
        commit('dataRequestError', error.response.data.error)
    }
    else {
        commit('dataRequestError', { code: 1, message: 'Error: connecting to the server.'})
    }
}

function copyMeetAndSession(meets, {meetId, sessionNum} ) {
    const meet = findMeetById(state.meets, meetId)
    const session = findSessionByNumber(meet.sessions, sessionNum)

    const meetCopy= JSON.parse(JSON.stringify(meet))
    const sessCopy = JSON.parse(JSON.stringify(session))

    delete meetCopy.sessions
    meetCopy.session = sessCopy
    meetCopy.events = []

    return meetCopy
}

function findMeetById(meets, id) {
    return meets.find( (meet) => meet._id === id)
}

const findSessionByNumber = (sessions, sessNum) => {
    return  sessions.find( (session) => session.number === sessNum)
}

const state = {
    activeEvent: false, // reference to the active event within activeMeet
    activeMeet: false,  // A copy of the selected meet & session
    loading: false,     // true when retrieving meets from DB
    loadingError: '',   // contains data retrieval error message
    meets: []           // meets retrieved from DB
}

const getters = {
    getEntriesByHeat: (state) => (heatNum) => {
        console.log(`meetStore::getEntriesByHeat heat #${heatNum}`)
        if (state.activeEvent.heats && state.activeEvent.heats.length >= heatNum) {
            return state.activeEvent.heats[heatNum - 1].entries
        }
        else {
            return []
        }
    },
    numLanes: state => { return state.activeEvent.numLanes ? state.activeEvent.numLanes : 8 }
}

const mutations = {
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
    setActiveEvent(state, event) {
        state.activeEvent = event
    },
    setActiveMeet(state, meet) {
        state.activeMeet = meet
    },
    setMeets(state, meets) {
        state.meets = meets
    }
}

const actions = {
    async loadEvent( {commit}, payload) {
        let   heats = []
        const event = payload.event
        console.log('loadEvent, payload: ', event)
        commit('dataRequested')
        try {
            const response = await apiSvc.getHeats(event._id)
            heats = response.data
            console.log(`/api/event/heats returns with heats.length = ${heats.length}`)

            // TODO:  We really want to save the event and heat data in a cache.
            //        For now just save a copy in activeEvent
            const eventCopy = JSON.parse(JSON.stringify(event))
            eventCopy.heats = heats
            commit('setActiveEvent', eventCopy)
        }
        catch(error) {
            commitError(commit, error)
        }
        finally {
            commit('dataRequestFinished')
        }
        return (heats)
    },

    async loadEvents( {commit, state}, payload) {
        commit('dataRequested')
        try {
            const meet = copyMeetAndSession(state.meets, payload)
            if (!meet) {
                console.log('No meet found from payload:', payload)
            }
            else {
                const response = await apiSvc.getEvents(payload.meetId, payload.sessionNum)

                meet.events = response.data
                console.log(`/api/events return with events.length = ${meet.events.length}`)
                commit('setActiveMeet', meet)
            }
        }
        catch(error) {
            commitError(commit, error)
        }
        finally {
            commit('dataRequestFinished')
        }
    },

    async loadMeets( {commit} ) {
        commit('dataRequested')
        try {
            const response = await apiSvc.getMeets()
            const meets = response.data
            console.log(`/api/meets returns with meets.length = ${meets.length}`)
            commit('setMeets', meets)
        }
        catch(error) {
            commitError(commit, error)
        }
        finally {
            commit('dataRequestFinished')
        }
    }
}

export const meetStore = {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
}

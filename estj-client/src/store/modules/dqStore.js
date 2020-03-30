/**
 * Store holding DQ information produced by this stroke and turn official
 */
import apiSvc from '../../services/api'

function createDqKey(dqData) {
    const heatId = dqData.heat ? dqData.heat._id : ''
    const lane   = dqData.lane ? dqData.lane : 0
    return {heatId, lane}
}

// Returns an array without the DQ identified by the key
function removeDqByKey(dqArray, key) {
    return dqArray.filter( function(dq) {
        return dq.heat._id !== key.heatId  &&  dq.lane !== key.lane
    })
}

/**
 * Submit the DQ to the backend API server
 * @param dqData - Contains all the DQ data
 * @returns {Promise<{}>} Resolves the response from the API server
 */
async function submitDq(dqData) {
    let response = {}
    try {
        response = await apiSvc.submitDq(dqData)
    }
    catch (error) {
        const errCode = error.response.status
        const errMsg = error.response.data.error
        console.log(`DQ store: submit caught dq exception: ${errCode}: ${errMsg}`)
    }
    return response
}

/**
 * Submit the deletion of the DQ to the backend API server
 * @param dqArray - the local vuex store of dqs
 * @param key - the DQ data (heatId, lane) identifying which DQ to delete
 * @returns {Promise<void>}
 */
async function submitDeleteDq(dqArray, key) {
    try {
        const dq = dqArray.find( (dq) => { return (dq.heat._id === key.heatId && dq.lane === key.lane) } )
        if (dq && dq._id){
            await apiSvc.removeDq(dq._id)
        }
        else {
            console.log(`dqStore: submitDeleteDq - no ${dq ? 'DQ' : '_id'} found`)
        }
    }
    catch (error) {
        const errCode = error.response.status
        const errMsg = error.response.data.error
        console.log(`DQ store: submitDeleteDq caught dq exception: ${errCode}: ${errMsg}`)
    }
}

const state = {
    dqs: []
}

const getters = {
    isDqd: (state) => (heat, lane) => {
        const idx = state.dqs.findIndex( (dqData) => {
            return dqData.heat._id === heat._id  &&  dqData.lane === lane
        })
        return  idx !== -1
    }
}

const mutations = {
    addDq(state, dqData) {
        state.dqs.push(dqData)
        console.log(`dqStore:addDq, dqData._id=${dqData._id}, dqs.length=${state.dqs.length}`)
    },
    clearDqs(state) {
        state.dqs = []
    },
    removeDq(state, key) {
        state.dqs = removeDqByKey(state.dqs, key)
        console.log(`dqStore:removeDq, dqs.length=${state.dqs.length}`)
    }
}

const actions = {
    /**
     * Add the DQ data to the local vuex store as well as the DB
     * @param commit
     * @param dqData - The DQ data
     * @returns {Promise<{}>} Promise resolves to an object with the DQ's id from the DB
     */
    async addDq ({commit}, dqData) {
        // always commit dq to vuex store, even if not able to store in DB.
        let dqResponse = {dqId: ''}
        try {
            const response = await submitDq(dqData)
            dqResponse = response.data
            dqData._id = dqResponse.dqId
        }
        catch(err) {
            console.log('Problem adding DQ to DB: ', err)
        }

        commit('addDq', dqData)
        return Promise.resolve(dqResponse)
    },
    async removeDq ({commit, state}, dqData) {
        const key = createDqKey(dqData)
        await submitDeleteDq(state.dqs, key)
        commit('removeDq', key)
    },
    removeAllDqs({commit}) {
        commit('clearDqs')
        // TODO: what to send in dqData  (dqData.dq-id = 'ALL' ?)
    }
}

export const dqStore = {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
}

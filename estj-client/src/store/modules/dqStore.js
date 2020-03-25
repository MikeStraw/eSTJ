/**
 * Store holding DQ information produced by this stroke and turn official
 */

// Returns an array without the DQ identified by the key
function removeDqByKey(dqArray, key) {
    return dqArray.filter( function(dqData) {
        return dqData.heat._id !== key.heatId  &&  dqData.lane !== key.lane
    })
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
        console.log(`dqStore:addDq, dqs.length=${state.dqs.length}`)
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
    addDq ({commit}, dqData) {
        commit('addDq', dqData)
    },
    removeDq ({commit}, heat, lane) {
        commit('removeDq', {heatId: heat._id, lane: lane})
    },
    removeAllDqs({commit}) {
        commit('clearDqs')
    }
}

export const dqStore = {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
}

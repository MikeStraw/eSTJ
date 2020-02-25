import apiSvc from '../../services/api'
import tokenSvc from '../../services/token'
import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

async function submitLogin(userData)
{
    let errCode = 0
    let errMsg = ''
    let token = false
    let user = false

    try {
        const response = await apiSvc.login(userData)
        token = response.data.token
        user = tokenSvc.decodeToken(token)

        if (! user) {
            errCode = 500
            errMsg = 'Invalid auth token received'
            console.error(`${errMsg}: ${token}`)
        }
    }
    catch (error) {
        errCode = error.response.status
        errMsg = error.response.data.error
        console.log(`store caught login exception: ${errCode}: ${errMsg}`)

        if (errCode === 401) {
            errMsg = 'Invalid Pin'
        }
    }

    return errCode ? {errCode: errCode, errMsg: errMsg} : {user: user, token: token}
}

const state = {
    authenticating: false,
    authError: '',
    authErrorCode: '',
    user: false
}

const getters = {

}

const mutations = {
    loginStarted(state) {
        state.authenticating = true
        state.authError = ''
        state.authErrorCode = ''
    },
    loginFinished(state) {
        state.authenticating = false
    },
    setError(state, {errCode, errMsg}) {
        state.authError = errMsg
        state.authErrorCode = errCode
    },
    setUser(state, newUser) {
        state.user = newUser
    }
}

const actions = {
    async login( {commit}, userData) {
        commit('loginStarted')
        const resp = await submitLogin(userData)

        if (resp.user) {
            tokenSvc.saveToken(resp.token)
            apiSvc.addAuthHeader(resp.token)
            console.log(`User ${resp.user.first} ${resp.user.last} logging in.`)
            commit('setUser', resp.user)
        }
        else {
            commit('setError', resp)
        }
        commit('loginFinished')
    },

    logout( ) {
        const first = state.user.first ? state.user.first : ''
        const last  = state.user.last  ? state.user.last  : ''
        tokenSvc.removeToken()
        console.log(`User ${first} ${last} logging out.`)
        location.reload() // reload from the server starts vuex fresh
    },

    setUser( {commit}, user ) {
        commit('setUser', user)
    }
}


export const authStore = {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
}

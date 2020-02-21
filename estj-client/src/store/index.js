import apiSvc from '../services/api'
import tokenSvc from '../services/token'
import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

const store = new Vuex.Store({
    state: {
        user: false
    },
    mutations: {
        setUser(state, newUser) {
            state.user = newUser
        }
    },
    actions: {
        login( {commit}, token) {
            const user = tokenSvc.decodeToken(token)

            if (user) {
                tokenSvc.saveToken(token)
                apiSvc.addAuthHeader(token)
                console.log(`User ${user.first} ${user.last} logging in.`)
                commit('setUser', user)
            }
            else {
                console.error(`Invalid auth token received: ${token}`)
                throw new Error('Invalid auth token received')
            }
        },
        logout( ) {
            tokenSvc.removeToken()
            console.log(`User ${this.state.user.first} ${this.state.user.last} logging out.`)
            location.reload() // reload from the server starts vuex fresh
        }
    },
    getters: {
    }
})
export default store

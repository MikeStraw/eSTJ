import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

const store = new Vuex.Store({
    state: {
        user: null
    },
    mutations: {
        setUser(state, newUser) {
            state.user = newUser
        }
    },
    actions: {
        removeUser( {commit} ) {
            commit('setUser', null)
        },
        saveUser( {commit}, user) {
            commit('setUser', user)
        }
    },
    getters: {
    }
})
export default store
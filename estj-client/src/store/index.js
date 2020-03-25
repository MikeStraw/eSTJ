import { authStore } from './modules/authStore'
import { dqStore }  from './modules/dqStore'
import { meetStore } from './modules/meetStore'
import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
    modules: {
        auth: authStore,
        dq:   dqStore,
        meet: meetStore
    }
})

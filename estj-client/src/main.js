import App from './App.vue'
import apiSvc from './services/api'
import tokenSvc from './services/token'
import router from './router'
import sseClient from './services/sseClient'
import store from './store'
import Vue from 'vue'

import vuetify from './plugins/vuetify'

Vue.config.productionTip = false
const initialState = JSON.parse(window.__INITIAL_STATE__ ? window.__INITIAL_STATE__ : '{}')
initialState.hostUrl = window.location.href

console.log('initial state: ', initialState)
apiSvc.init( initialState )

new Vue({
    router,
    store,
    created() {
        const token = tokenSvc.getToken()
        if (token) {
            const user = tokenSvc.decodeToken(token)
            if (user) {
                apiSvc.addAuthHeader(token)
                this.$store.dispatch('auth/setUser', user).then( () => {
                    console.log('Auto-Login: successful Login')
                    sseClient.connectToStream()
                })
            }
            else {
                this.$store.dispatch('logout').then( () => {
                    console.log('Auto-Login: error ... logout')
                })
            }
        }
    },
    beforeDestroy() {
        sseClient.closeStream()
    },
    vuetify,
    render: h => h(App)
}).$mount('#app')

import App from './App.vue'
import apiSvc from './services/api'
import tokenSvc from './services/token'
import router from './router'
import store from './store'
import Vue from 'vue'

import vuetify from './plugins/vuetify'

Vue.config.productionTip = false
const initialState = JSON.parse(window.__INITIAL_STATE__)
initialState.hostUrl = window.location.href

console.log('initial state: ', initialState)
apiSvc.init( initialState )

new Vue({
    router,
    store,
    created() {
        // Check local storage for the user token.  If found "auto-login" user.
        const token = tokenSvc.getToken()
        if (token) {
            console.log('Found auth token in localstorage, attempting auto-login')
            this.$store.dispatch('login', token)
                .catch( () => {
                    this.$store.dispatch('logout')
                })
        }
    },
    vuetify,
    render: h => h(App)
}).$mount('#app')

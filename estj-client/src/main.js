import App from './App.vue'
import tokenSvc from './services/token'
import router from './router'
import store from './store'
import Vue from 'vue'

import vuetify from './plugins/vuetify'

Vue.config.productionTip = false

new Vue({
    router,
    store,
    created() {
        // Check local storage for the user token.  If found
        // "auto-login" user.
        const token = tokenSvc.getToken()
        if (token) {
            const user = tokenSvc.decodeToken(token)
            if (user) {
                console.log(`Found user ${user.first} ${user.last} in localstorage`)
                this.$store.dispatch('saveUser', user)
            }
            else {
                // token is not valid, remove it
                tokenSvc.removeToken()
                this.$store.dispatch('removeUser')  // TODO:  implement logout action
            }
        }
    },
    vuetify,
    render: h => h(App)
}).$mount('#app')
import Vue from 'vue'
import Router from 'vue-router'
import LoginView from './views/Login.vue'
import NotFound from './views/NotFound'


Vue.use(Router)

const router = new Router({
    mode: 'history',
    routes: [
        {
            path: '/',
            redirect: { name: 'login'}
        },
        {
            path: '/login',
            name: 'login',
            component: LoginView
        },
        {
            path: '/404',
            name: '404',
            component: NotFound
        },
        {
            path: '*',
            redirect: { name: '404' }
        }
    ]
})

export default router
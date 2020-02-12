import LoginView from './views/Login'
import MeetsView from './views/Meets'
import NotFound from './views/NotFound'
import Router from 'vue-router'
import Vue from 'vue'

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
            path: '/meets',
            name: 'meets',
            component: MeetsView
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
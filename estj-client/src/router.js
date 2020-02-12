import LoginView from './views/Login'
import MeetsView from './views/Meets'
import NotFound from './views/NotFound'
import Router from 'vue-router'
import tokenSvc from './services/token'
import Vue from 'vue'

Vue.use(Router)

const router = new Router({
    mode: 'history',
    routes: [
        {
            path: '/',
            redirect: { name: 'login'},
            meta: { public: true }
        },
        {
            path: '/login',
            name: 'login',
            component: LoginView,
            meta: { public: true }
        },
        {
            path: '/meets',
            name: 'meets',
            component: MeetsView
        },
        {
            path: '/404',
            name: '404',
            component: NotFound,
            meta: { public: true }
        },
        {
            path: '*',
            redirect: { name: '404' },
            meta: { public: true }
        }
    ]
})

router.beforeEach( (to, from, next) => {
    const isPublic = to.matched.some(record => record.meta.public)
    const loggedIn = !!tokenSvc.getToken()

    if (!isPublic && !loggedIn) {
        return next({
            path: '/login',
            query: { redirect: to.fullPath } // Store the full path to redirect the user to after login
        })
    }
    next()
})

export default router
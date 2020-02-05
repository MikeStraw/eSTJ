const debug  = require('debug')('estj-server')
const Router = require('koa-router')

const router = new Router()

router.get('/', async (ctx) => {
    ctx.body = {message: 'Hello world from get.'}
})

router.get('/login', async (ctx) => {
    ctx.redirect('/')
    ctx.status = 301
})

router.post('/login', async (ctx) => {
    let firstname = ctx.request.body.firstname
    let lastname = ctx.request.body.lastname
    let pin = ctx.request.body.pin
    debug(`first=${firstname}, last=${lastname} and pin=${pin}`)

    if (firstname && lastname && pin) {
        ctx.body = {message: `Hello ${firstname} ${lastname} from /login.`}
    }
    else {
        ctx.status = 401
        ctx.body = {error: 'Invalid login'}
    }
})

module.exports = router
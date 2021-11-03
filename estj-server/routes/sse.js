const debug  = require('debug')('estj-server')
const jwt    = require('../services/jwt')
const Router = require('koa-router')
const Sse    = require('../services/sse')
const router = new Router()

// Make sure client is logged in.
// router.use(jwt.errorHandler()).use(jwt.jwt())

router.get('/sse', async (ctx) => {
    debug('/sse called')
    const sse = new Sse(ctx)

    sse.on('close', () => {
        debug('/sse caught close signal ... stopping interval')
    })
    sse.on('error', () => {
        debug('/sse caught error signal ... stopping interval')
    })

    debug('/sse leaving')
})

module.exports = router

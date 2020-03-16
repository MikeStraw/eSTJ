const debug  = require('debug')('estj-server')
const Heat   = require('../models/Heat')
const Event  = require('../models/Event')
const jwt    = require('../services/jwt')
const Meet   = require('../models/Meet')
const Router = require('koa-router')

const router = new Router()

// Apply JWT middleware to check for JWT token in auth header.
// If token is valid, ctx.state.user contains the decoded JSON token object.
// Otherwise a 401 - Not Authorized response is returned.
router.use(jwt.errorHandler()).use(jwt.jwt())

router.get('/api/event/:eventId/heats', async (ctx) => {
    const eventId = ctx.params.eventId
    debug(`/api/:eventId/heats called with eventID=${eventId}`)

    if (! eventId) {
        debug('apiRouter.getHeats: No event-id ...')
        ctx.status = 400
        ctx.body= json({ message: 'Required parameter eventId missing.' })
    }
    else {
        const heats = await Heat.find({'event_id': eventId})
        ctx.body = heats
    }
})

router.get('/api/meets', async (ctx) => {
    ctx.body = await Meet.find( {} )
})

router.get('/api/meet/:id/session/:num/events', async (ctx) => {
    const meetId = ctx.params.id
    const sessNum = ctx.params.num

    if (!meetId || !sessNum) {
        ctx.status = 400
        ctx.body = json({ message: 'Required parameter meetId or sessNum missing.' })
    }
    else {
        ctx.body = await Event.find({meet_id: meetId, session_num: sessNum})
    }
})

module.exports = router

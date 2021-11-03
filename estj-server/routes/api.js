const debug  = require('debug')('estj-server')
const DQ     = require('../models/Dq')
const Heat   = require('../models/Heat')
const Event  = require('../models/Event')
const jwt    = require('../services/jwt')
const Meet   = require('../models/Meet')
const Router = require('koa-router')

const router = new Router()

function createDqFromRequest(reqBody) {
    // Take the bits and pieces of the incoming DQ data.
    // Meet, session and event info can come from heat_id.
    const heatId = reqBody.heat ? reqBody.heat._id : ''
    const userId = reqBody.user ? reqBody.user._id : ''

    const dqData = {
        heat_id: heatId, user_id: userId,
        lane: reqBody.lane, notes: reqBody.notes, reason: reqBody.reason, relayLeg: reqBody.relayLeg
    }
    console.log('createDqFromRequest, dqData:', dqData)
    return new DQ(dqData)
}

// Apply JWT middleware to check for JWT token in auth header.
// If token is valid, ctx.state.user contains the decoded JSON token object.
// Otherwise a 401 - Not Authorized response is returned.
router.use(jwt.errorHandler()).use(jwt.jwt())

router.delete('/api/dq/:dqId', async (ctx) => {
    const dqId = ctx.params.dqId
    debug(`/api/dq/:dqId, dqId=${dqId}`)

    if (dqId) {
        await DQ.deleteOne({_id: dqId})
        ctx.status = 200
        ctx.body =  {status: "OK"}
    }
    else {
        debug('apiRouter.deleteDq: No dq-id ...')
        ctx.status = 400
        ctx.body= { message: 'Required parameter dqId missing.' }
    }
})

router.post('/api/dq', async (ctx) => {
    const dq = createDqFromRequest(ctx.request.body)
    const dqFromDb = await dq.save()

    ctx.status = 201
    ctx.body = {dqId: dqFromDb._id}
})

router.get('/api/event/:eventId/heats', async (ctx) => {
    const eventId = ctx.params.eventId
    debug(`/api/:eventId/heats called with eventID=${eventId}`)

    if (! eventId) {
        debug('apiRouter.getHeats: No event-id ...')
        ctx.status = 400
        ctx.body= { message: 'Required parameter eventId missing.' }
    }
    else {
        ctx.body = await Heat.find({'event_id': eventId})
    }
})

router.get('/api/heat/:heatId', async(ctx) => {
    const heatId = ctx.params.heatId
    debug(`/api/heat/:heatId called with heatID=${heatId}`)

    if (! heatId) {
        debug('apiRouter.getHeat: No heat-id ...')
        ctx.status = 400
        ctx.body= { message: 'Required parameter heatId missing.' }
    }
    else {
        ctx.body = await Heat.findOne({'_id': heatId})
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
        ctx.body = { message: 'Required parameter meetId or sessNum missing.' }
    }
    else {
        ctx.body = await Event.find({meet_id: meetId, session_num: sessNum})
    }
})

module.exports = router

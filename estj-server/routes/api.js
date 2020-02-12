const jwt    = require('../services/jwt')
const Meet   = require('../models/Meet')
const Router = require('koa-router')

const router = new Router()

// Apply JWT middleware to check for JWT token in auth header.
// If token is valid, ctx.state.user contains the decoded JSON token object.
// Otherwise a 401 - Not Authorized response is returned.
router.use(jwt.errorHandler()).use(jwt.jwt())

router.get('/api/meets', async (ctx) => {
    ctx.body = await Meet.find( {} )
})

module.exports = router
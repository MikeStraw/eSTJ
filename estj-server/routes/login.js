const debug  = require('debug')('estj-server')
const jwtSvc = require('../services/jwt')
const Router = require('koa-router')
const User   = require('../models/User')

const router = new Router()
const validPin = process.env.LOGIN_PIN ? process.env.LOGIN_PIN : '12345'

router.get('/login', async (ctx) => {
    ctx.redirect('/')
    ctx.status = 301
})

/**
 * Saves or updates the user in the Mongo DB.
 * @param {String} firstName - Thd official's first name
 * @param {String} lastName - The official's last name
 * @returns {User} - the User object (POJO, not Mongoose Document)
 */
async function saveUserToDB(firstName, lastName)
{
    const now = new Date()
    const queryObj = {'first': firstName, 'last': lastName}

    let user = await User.findOne(queryObj).exec()
    if (user) {
        debug(`Found user ${user.first} ${user.last}`)
        user.lastLogin = now

        const updateOpts = {'new': true, 'upsert': true, 'runValidators': true}
        user = await User.findOneAndUpdate(queryObj, user, updateOpts).exec()
    }
    else {
        const newUser = new User({'first': firstName, 'last': lastName, 'lastLogin': now} )
        user = await newUser.save()
    }
    return user.toObject()       // toObject removes extra Mongoose stuff
}

router.post('/login', async (ctx) => {
    const firstname = ctx.request.body.firstname ? ctx.request.body.firstname.trim() : ''
    const lastname  = ctx.request.body.lastname ? ctx.request.body.lastname.trim() : ''
    const pin       = ctx.request.body.pin ? ctx.request.body.pin.trim() : ''
    debug(`first=${firstname}, last=${lastname} and pin=${pin}`)

    if (pin !== validPin) {
        ctx.status = 401
        ctx.body = {error: 'Invalid login'}
    }
    else if (! (firstname && lastname)) {
        ctx.status = 400
        ctx.body = {error: 'Missing information'}
    }
    else {
        const user = await saveUserToDB(firstname, lastname)
        const token = jwtSvc.issueToken(user)
        ctx.status = 201
        ctx.body = {token: token}
    }
})

module.exports = router

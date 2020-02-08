//routes.test.js
const apiServer = require('../apiServer')
const dbUtil    = require('./dbUtils')
const request   = require('supertest')
const User      = require('../models/User')

let server

beforeAll(async () => {
    await dbUtil.connectToDB('stj-test')
    server = apiServer.startServer()     // TODO:  how to start apiServer with known pin????
})


afterAll( async () => {
    apiServer.stopServer()
    await dbUtil.closeDb()
})

afterEach(async () => {
    await dbUtil.removeCollectionData()
})


describe('basic route tests', () => {
    it('submitting a valid login form should return a JWT token', async done => {
        const response = await request(server).post('/login')
            .send({firstname: 'Buggs', lastname: 'Bunny', pin: '12345'})
            .set('Accept', 'application/json')

        expect(response.status).toEqual(201)
        expect(response.body.token).toBeDefined()
        done()
    })
    it('submitting a valid login form should create an entry in the DB', async done => {
        const firstname = 'Buggs'
        const lastname  = 'Bunny'
        const response = await request(server).post('/login')
            .send({firstname: firstname, lastname: lastname, pin: '12345'})
            .set('Accept', 'application/json')
        expect(response.status).toEqual(201)

        const user = await User.findOne( {first: firstname, last: lastname} )
        expect(user).not.toBeNull()
        expect(user.first).toBe(firstname)
        expect(user.last).toBe(lastname)
        done()
    })
    it('submitting an incomplete login form should return a client error code', async done => {
        const response = await request(server).post('/login')
            .send({firstname: 'Buggs',  pin: '12345'})
            .set('Accept', 'application/json')

        expect(response.status).toEqual(400)
        done()
    })
    it('submitting an invalid pin with the  form should return a client error code', async done => {
        const response = await request(server).post('/login')
            .send({firstname: 'Buggs', lastname: 'Bunny', pin: 'xxxxx'})
            .set('Accept', 'application/json')

        expect(response.status).toEqual(401)
        done()
    })
})
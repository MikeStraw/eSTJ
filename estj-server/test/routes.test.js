//routes.test.js
const apiServer = require('../apiServer')
const dbUtil    = require('./dbUtils')
const meetDbo   = require('../services/SwimMeetDbo')
const request   = require('supertest')
const testUtils = require('./testUtils')
const User      = require('../models/User')

let server

beforeAll(async () => {
    await dbUtil.connectToDB('stj-test')
    server = apiServer.startServer()
})

afterAll( async () => {
    apiServer.stopServer()
    await dbUtil.closeDb()
})

afterEach(async () => {
    await dbUtil.removeCollectionData()
})

async function login()  {
    console.log('Sending login request')
    const response = await request(server).post('/login')
        .send({firstname: 'Buggs', lastname: 'Bunny', pin: '12123'})
        .set('Accept', 'application/json')

    return response.body.token
}

describe('basic public route tests', () => {
    it('submitting a valid login form should return a JWT token', async done => {
        const response = await request(server).post('/login')
            .send({firstname: 'Buggs', lastname: 'Bunny', pin: '12123'})
            .set('Accept', 'application/json')

        expect(response.status).toEqual(201)
        expect(response.body.token).toBeDefined()
        done()
    })
    it('submitting a valid login form should create an entry in the DB', async done => {
        const firstname = 'Buggs'
        const lastname  = 'Bunny'
        const response = await request(server).post('/login')
            .send({firstname: firstname, lastname: lastname, pin: '12123'})
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
            .send({firstname: 'Buggs',  pin: '12123'})
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

describe('basic API route tests', () => {
    it('/api/meets should return 401 unauthorized without sending JWT token', async done => {
        const response = await request(server).get('/api/meets')
            .set('Accept', 'application/json')

        expect(response.status).toEqual(401)
        done()
    })

    it('/api/meets should return an empty list of meets when no meets are in the DB', async done => {
        const token = await login()
        const response = await request(server).get('/api/meets')
            .set('Accept', 'application/json')
            .set('Authorization', `Bearer ${token}`)

        expect(response.status).toEqual(200)
        expect(response.body.length).toBe(0)
        done()
    })

    it('/api/meets should return a list of meets when there are meets in the DB', async done => {
        const json = testUtils.readTestFile('valid_meet_with_session_event_heat.json')
        await meetDbo.saveToDB(json)

        const token = await login()
        const response = await request(server).get('/api/meets')
            .set('Accept', 'application/json')
            .set('Authorization', `Bearer ${token}`)

        expect(response.status).toEqual(200)
        expect(response.body.length).toBe(1)
        done()
    })
})

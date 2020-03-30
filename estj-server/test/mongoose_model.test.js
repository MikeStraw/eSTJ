const dbUtil   = require('./dbUtils')
const DQ       = require('../models/Dq')
const Event    = require('../models/Event')
const Heat     = require('../models/Heat')
const Meet     = require('../models/Meet')
const meetDbo  = require('../services/SwimMeetDbo')
const testUtils= require('./testUtils')


beforeAll( async() => {
    await dbUtil.connectToDB('stj-test')
})

afterAll(async () => {
    await dbUtil.closeDb()
})

afterEach(async () => {
    await dbUtil.removeCollectionData()
})


describe('Mongo-Mongoose Model Tests', () => {
    it('should add meet, event and heat data for a valid meet file', async done => {
        const json = testUtils.readTestFile('valid_meet_with_session_event_heat.json')
        await meetDbo.saveToDB(json)

        const meet = await Meet.findOne(json)
        expect(meet).not.toBeNull()
        expect(meet.sessions.length).toBe(1)

        const event = await Event.findOne({'meet_id': meet._id, 'session_num': meet.sessions[0].number})
        expect(event).not.toBeNull()
        expect(event.desc).toContain('Butterfly')

        const heat = await Heat.findOne({'event_id': event._id})
        expect(heat).not.toBeNull()
        expect(heat.entries.length).toBe(1)

        done()
    })

    it('should add a DQ with valid data', async done => {
        const dq = new DQ({
            heat_id: '123', user_id: '456', lane: 7, notes: 'i am a note', reason: 'because I said so', relayLeg: ''
        })

        const dqFromDb = await dq.save()
        expect(dqFromDb._id).not.toBeNull()
        done()
    })

    it('should reject a meet without the required meet data', async done => {
        const meet = testUtils.readTestFile('valid_meet_with_session_event_heat.json')
        delete meet.numLanes

        expect.assertions(1)
        try {
            await meetDbo.saveToDB(meet)
        }
        catch(error) {
            expect(error.message).toContain('numLanes')
        }
        done()
    })

    it('should reject a meet without the required session data', async done => {
        const meet = testUtils.readTestFile('valid_meet_with_session_event_heat.json')
        const session = meet.sessions[0]
        delete session.day

        expect.assertions(1)
        try {
            await meetDbo.saveToDB(meet)
            expect(false)
        }
        catch(error) {
            expect(error.message).toContain('day')
        }
        done()
    })

    it('should reject an event without the required data', async done => {
        const meet = testUtils.readTestFile('valid_meet_with_session_event_heat.json')
        const session = meet.sessions[0]
        const event = session.events[0]
        delete event.desc

        expect.assertions(1)
        try {
            await meetDbo.saveToDB(meet)
            expect(false)
        }
        catch(error) {
            expect(error.message).toContain('desc')
        }

        done()
    })

    it('should reject a heat without the required data', async done => {
        const meet = testUtils.readTestFile('valid_meet_with_session_event_heat.json')
        const session = meet.sessions[0]
        const event = session.events[0]
        const entry = event.entries[0]
        delete entry.team

        expect.assertions(1)
        try {
            await meetDbo.saveToDB(meet)
            expect(false)
        }
        catch(error) {
            expect(error.message).toContain('team')
        }
        done()
    })

    it('should reject a DQ without the required data', async done => {
        // DQ.reason missing
        const dq = new DQ({heat_id: '123', user_id: '456', lane: 7, notes: 'i am a note'})

        expect.assertions(1)
        try {
            const dqFromDb = await dq.save()
            expect(false)
        }
        catch(error) {
            expect(error.message).toContain('reason')
        }

        done()
    })
})

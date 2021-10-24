const dbUtil   = require('./dbUtils')
const Event    = require('../models/Event')
const Heat     = require('../models/Heat')
const meetDbo  = require('../services/SwimMeetDbo')
const meetUpdate = require('../services/fileUpdate')
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

describe('SwimMeetDbo Tests', () => {
    it('updated final times in a heat should get updated to the DB', async done => {
        const curJson = testUtils.readTestFile('meet_with_3_events.json')
        const newJson = testUtils.readTestFile('meet_with_3_events_update_final_time.json')
        const meetId = await meetDbo.saveToDB(curJson)
        const updateItem = {meetId: meetId, abortUpdate: false, event: 1, field: 'final',
            heat: 1, ignoreUpdate: false, lane: 5, session: 1}

        // Get the new entries from newJson (sessionIdx, event#, heat#)
        const newEntries = meetUpdate.getHeatEntries(newJson, updateItem)
        expect(newEntries.length).toBe(4)

        await meetDbo.updateHeatEntries(newEntries, updateItem)

        // Check that final time exists
        const event = await Event.findOne({meet_id: meetId, number: updateItem.event})
        const eventId = event._id
        const heat = await Heat.findOne({'event_id': eventId, number: updateItem.heat})
        expect(heat).not.toBeNull()
        expect(heat.entries.length).toBe(4)
        expect(heat.entries[0].final).toMatch(new RegExp(/\d:\d\d.\d\d/))   // eg. "1:23.45"
        //console.log(heat.entries[0].final)

        done()
    })
})

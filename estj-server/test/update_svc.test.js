const fs        = require('fs')
const testUtils = require('./testUtils')
const updateSvc = require('../services/fileUpdate')

let backupDir   = './test/data'

afterAll( () => {
    const files = fs.readdirSync(backupDir)
    const regex = '.*\.[0-9].json$'

    files.forEach(function (file) {
        if (file.match(regex)) {
            fs.unlinkSync(`${backupDir}/${file}`)
        }
    })
    //console.log('afterAll, finished removing backup files ...')
})

describe('JSON Meet File Update Tests', () => {
    it('File update without changes should not return any update items.', async done => {
        const curJson = testUtils.readTestFile('valid_meet_with_session_event_heat.json')
        const newJsonFileSpec = './test/data/valid_meet_with_session_event_heat.json'

        let result = updateSvc.processUpdate(newJsonFileSpec, curJson)

        expect(result.updateItems.length).toBe(0)
        expect(result.updateSupported).toBe(true)
        done()
    })

    it('File update without meaningful changes should not return any update items.', async done => {
        const curJson = testUtils.readTestFile('valid_meet_with_session_event_heat.json')
        const newJsonFileSpec = './test/data/valid_meet_with_session_event_heat.json'

        curJson.type = 'Age Group'
        let result = updateSvc.processUpdate(newJsonFileSpec, curJson)

        expect(result.updateItems.length).toBe(0)
        expect(result.updateSupported).toBe(true)
        done()
    })

    it('Updating final times in a single heat should return 1 update item for that heat.', async done => {
        const curJson = testUtils.readTestFile('meet_with_3_events.json')
        const newJsonFileSpec = './test/data/meet_with_3_events.json'

        // remove final time from event #2 entries (all heat #1)
        const eventEntries = curJson.sessions[0].events[1].entries
        eventEntries.forEach( entry => entry.final = '')

        let result = updateSvc.processUpdate(newJsonFileSpec, curJson)

        // Expect 1 update item for event #2, heat #1
        expect(result.updateItems.length).toBe(1)
        expect(result.updateSupported).toBe(true)
        expect(result.updateItems[0].event).toBe(2)
        expect(result.updateItems[0].heat).toBe(1)

        done()
    })

    it('Updating final times in two heats should return 2 update items for the heats.', async done => {
        const curJson = testUtils.readTestFile('meet_with_3_events.json')
        const newJsonFileSpec = './test/data/meet_with_3_events.json'

        // remove final time from event #1 entries (both heat #1 and #2)
        const eventEntries = curJson.sessions[0].events[0].entries
        eventEntries.forEach( entry => entry.final = '')

        let result = updateSvc.processUpdate(newJsonFileSpec, curJson)

        // Expect 2 update items ...event #1, heat #1 and event #1 heat #2
        expect(result.updateItems.length).toBe(2)
        expect(result.updateSupported).toBe(true)
        expect(result.updateItems[0].event).toBe(1)
        expect(result.updateItems[0].heat).toBeLessThan(3)  // could be heat 1 or 2
        expect(result.updateItems[1].event).toBe(1)
        expect(result.updateItems[1].heat).toBeLessThan(3)  // could be heat 1 or 2
        expect(result.updateItems[0].heat).not.toBe(result.updateItems[1].heat)

        done()
    })

    it('Adding an entry in a heat should return 1 updateItem for that event.', async done => {
        const curJson = testUtils.readTestFile('meet_with_3_events.json')
        const newJsonFileSpec = './test/data/meet_with_3_events.json'

        // remove the last entry from event #2 (removing from curJson is like an add for newJson)
        const eventEntries = curJson.sessions[0].events[1].entries
        eventEntries.pop()

        let result = updateSvc.processUpdate(newJsonFileSpec, curJson)

        // Expect 1 update item for event #2, heat #1
        expect(result.updateItems.length).toBe(1)
        expect(result.updateSupported).toBe(true)
        expect(result.updateItems[0].event).toBe(2)

        done()
    })

    it('Deleting an entry in a heat should return 1 updateItem for that event.', async done => {
        const curJson = testUtils.readTestFile('meet_with_3_events.json')
        const newJsonFileSpec = './test/data/meet_with_3_events.json'

        // Add an entry to event #2 (adding to curJson is like a delete for newJson)
        const eventEntries = curJson.sessions[0].events[1].entries
        const newEntry = '{"athlete": {}, "final": "", "heat": 2, "lane": 1, "seed": "NT", "team": "" }'
        eventEntries.push(newEntry)

        let result = updateSvc.processUpdate(newJsonFileSpec, curJson)

        // Expect 1 update item for event #2, heat #1
        expect(result.updateItems.length).toBe(1)
        expect(result.updateSupported).toBe(true)
        expect(result.updateItems[0].event).toBe(2)

        done()
    })

    it('Switching lanes within a single heat should return 1 update item for that heat.', async done => {
        const curJson = testUtils.readTestFile('meet_with_3_events.json')
        const newJsonFileSpec = './test/data/meet_with_3_events.json'

        // switch lanes
        const eventEntries = curJson.sessions[0].events[1].entries
        const tmp = eventEntries[0].lane
        eventEntries[0].lane = eventEntries[1].lane
        eventEntries[1].lane = tmp

        let result = updateSvc.processUpdate(newJsonFileSpec, curJson)

        // Expect 1 update item for event #2, heat #1
        expect(result.updateItems.length).toBe(1)
        expect(result.updateSupported).toBe(true)
        expect(result.updateItems[0].event).toBe(2)
        expect(result.updateItems[0].heat).toBe(1)

        done()
    })

    it('Adding an event should return an unsupported update result.', async done => {
        const curJson = testUtils.readTestFile('meet_with_3_events.json')
        const newJsonFileSpec = './test/data/meet_with_3_events.json'

        // remove the last event (removing from curJson is like an add for newJson)
        const events = curJson.sessions[0].events
        events.pop()

        let result = updateSvc.processUpdate(newJsonFileSpec, curJson)

        expect(result.updateItems.length).toBe(0)
        expect(result.updateSupported).toBe(false)

        done()
    })
})

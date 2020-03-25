import dqSvc from '../services/dq'

export default {
    data() {
        return {
            dqLane: 0  // just needed for DQ reactivity
        }
    },
    methods: {
        addDq(dqData) {
            this.dqLane++        // trigger reactivity
            dqSvc.addDq(dqData)
        },
        isDqd (event, heat, lane) {
            // add dqLane as a fake parameter so that isDqd is triggered
            // for all rows after a DQ is added or removed
            return dqSvc.isDqd(event, heat, lane , this.dqLane)
        },
        removeDq (event, heat, lane) {
            this.dqLane++         // trigger reactivity
            dqSvc.removeDq(event, heat, lane)
        },
        isLaneOccupied(lane) {
            const entry = this.getEntryByLane(lane)
            return !!entry.lane
        },
        getEntryByLane(lane) {
            const filterResults = (this.heat.entries && this.heat.entries)
                ? this.heat.entries.filter(entry => entry.lane === lane)
                : []
            return filterResults.length > 0 ? filterResults[0] : {}
        },
        getFinalTime(lane) {
            const entry = this.getEntryByLane(lane)
            return entry ? entry.final : ''
        },
        getName(lane) {
            const entry = this.getEntryByLane(lane)
            const athlete = entry ? entry.athlete : {}

            if (!athlete || !athlete.lname)  return ''
            else {return athlete.lname + ', ' + athlete.fname}
        },
        getSchoolYear(lane) {
            const entry = this.getEntryByLane(lane)
            const athlete = entry ? entry.athlete : {}

            return athlete ? athlete.schoolYear : ''
        },
        getSeedTime(lane) {
            const entry = this.getEntryByLane(lane )
            return entry ? entry.seed : ''
        },
        getTeam(lane) {
            const entry = this.getEntryByLane(lane)
            return entry ? entry.team : ''
        },
        onCancelDq(dlgData) {
            console.log(`Removing DQ from (${this.event.number}, ${this.heat.number}, ${dlgData.lane})`)
            this.removeDq(this.event.number, this.heat.number, dlgData.lane)
        },
        onDq(dlgData) {
            if (dlgData.status === 'submit') {
                const dqData = dlgData.data
                this.addDq(dqData)
            }
            else {
                console.log('DqDialog cancelled')
            }
        }
    },
    created() {
        // randomize dqLane so that switching from one event to another
        // will trigger reactivity
        this.dqLane = Math.floor(Math.random() * 1000)
        console.log(`heatMixin: randomizing dqLane, value=${this.dqLane}`)
    }
}

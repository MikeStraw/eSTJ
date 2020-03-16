export default {
    data() {
        return {
            dqRowIndexes: []
        }
    },
    methods: {
        dqAdd(index) {
            this.dqRowIndexes.push(index)
        },
        dqRemove(index) {
            this.dqRowIndexes = this.dqRowIndexes.filter((value) =>  value !== index )
        },
        isDqd(index) {
            return this.dqRowIndexes.includes(index)
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
            console.log(`Remove DQ from lane ${dlgData.lane}`)
            this.dqRemove(dlgData.lane)
        },
        onDq(dlgData) {
            if (dlgData.status === 'submit') {
                const dqData = dlgData.data
                console.log('Submit DQ data:', dqData)
                this.dqAdd(dqData.lane)
            }
            else {
                console.log('DqDialog cancelled')
            }
        }
    }
}

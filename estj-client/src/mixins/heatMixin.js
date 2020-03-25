// Common functionality for heat.vue and relayHeat.vue

import {mapGetters} from 'vuex'

export default {
    data() {
        return {
        }
    },
    computed: {
        ...mapGetters({
            isDqd: 'dq/isDqd'
        })
    },
    methods: {
        addDq(dqData) {
            this.$store.dispatch('dq/addDq', dqData)
        },
        removeDq (heat, lane) {
            this.$store.dispatch('dq/removeDq', heat, lane)
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
            this.removeDq(this.heat, dlgData.lane)
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
    }
}

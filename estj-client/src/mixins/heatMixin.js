// Common functionality for heat.vue and relayHeat.vue

import {mapGetters} from 'vuex'
import {mapState} from 'vuex'
import dqCancel from '../components/dqCancel'
import dqDialog from '../components/dqDialog'

export default {
    components: { dqCancel, dqDialog },
    props: {
        event: {type: Object, required: true},
        heat:  {type: Object, required: true},
        numLanes: {type: Number, required: true}
    },
    data() {
        return { }
    },
    computed: {
        ...mapGetters({
            isDqd: 'dq/isDqd'
        }),
        ...mapState({
            meet: state => state.meet.activeMeet,
            user: state => state.auth.user
        })
    },
    methods: {
        addDqData(dqData) {
            const leanDqData = JSON.parse(JSON.stringify(dqData))

            leanDqData.event = JSON.parse(JSON.stringify(this.event))
            leanDqData.heat  = JSON.parse(JSON.stringify(this.heat))
            delete leanDqData.heat.entries

            leanDqData.meet = JSON.parse(JSON.stringify(this.meet))
            delete leanDqData.meet.events
            delete leanDqData.meet.eventIdx

            leanDqData.user = JSON.parse(JSON.stringify(this.user))

            return leanDqData
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
        onCancelDq(dqData) {
            const leanDqData = this.addDqData(dqData)
            this.$store.dispatch('dq/removeDq', leanDqData)
                .then( (resp) => {console.log('heatMixin - removed DQ from DB', resp)})
                .catch( (err) => {console.log('heatMixin - caught error on dispatch(dq/removeDq)', err)})
        },
        onDq(dqData) {
            const leanDqData = this.addDqData(dqData)

            this.$store.dispatch('dq/addDq', leanDqData)
                .then( (resp) => {console.log('heatMixin - added DQ to DB', resp)})
                .catch( (err) => {console.log('heatMixin - caught error on dispatch(dq/addDq)', err)})
        }
    }
}

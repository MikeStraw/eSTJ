<template>
    <v-container fluid>
        <v-row>
            <v-col>
                <h5>{{meet.name}} - {{meet.session.name}}</h5>
                <h4 v-if="event" class="mt-2">Event {{event.number}} - {{event.desc}}</h4>
            </v-col>
        </v-row>
        <v-row v-if="numberOfHeats > 0">
            <v-col>
                <h4>Heat {{ heatIdx + 1 }} of {{ numberOfHeats }}</h4>
            </v-col>
        </v-row>
        <v-row>
            <v-col>
                <p v-if="loadingError" class="red--text text--darken-3 subheading">Error: {{loadingError}}</p>
                <p v-else-if="loading" class="blue-text">Loading heats and entries from server ...</p>
                <p v-else-if="numberOfHeats === 0">No heats available.</p>
            </v-col>
        </v-row>

        <div v-if="numberOfHeats > 0">
            <relayHeat v-if="event.isRelay" :event="event" :heat="heat" :numLanes="numberOfLanes"></relayHeat>
            <heat v-else :event="event" :heat="heat" :numLanes="numberOfLanes"></heat>
        </div>

        <v-row justify="space-between" class="mt-5">
            <v-btn v-if="hasPrevHeat" @click="gotoPreviousHeat" text>
                <v-icon left>mdi-arrow-left</v-icon>Previous Heat
            </v-btn>
            <v-btn v-else @click="gotoPreviousEvent" text>
                <v-icon left>mdi-arrow-left</v-icon>Previous Event
            </v-btn>

            <v-btn @click="gotoEventList" text><v-icon>mdi-list</v-icon>Event List</v-btn>

            <v-btn @click="refresh" text><v-icon left>mdi-refresh</v-icon>Refresh</v-btn>

            <v-btn v-if="hasNextHeat" @click="gotoNextHeat" text>Next Heat
                <v-icon right>mdi-arrow-right</v-icon>
            </v-btn>
            <v-btn v-else @click="gotoNextEvent" text>Next Event
                <v-icon right>mdi-arrow-right</v-icon>
            </v-btn>
        </v-row>
    </v-container>
</template>

<script>
import heat from '../components/heat'
import relayHeat from '../components/relayHeat'
import { mapState } from 'vuex'
export default {
    name: 'Event',
    components: { heat, relayHeat },
    props: ['event', 'loadlastheat'],
    data() {
        return {
            heat: {},        // the current heat of this event
            heats: [],       // array of heats
            heatIdx: 0       // current index into heats
        }
    },
    computed: {
        hasNextHeat:   function() { return this.heatIdx < (this.heats.length - 1) },
        hasPrevHeat:   function() { return this.heatIdx > 0 },
        numberOfHeats: function() { return  this.heats.length },
        numberOfLanes: function() { return this.event.numLanes ? this.event.numLanes : 0 },
        ...mapState({
            loading:      state => state.meet.loading,
            loadingError: state => state.meet.loadingError,
            meet:         state => state.meet.activeMeet
        })
    },
    filters: {
    },
    methods: {
        gotoEventList() {
            console.log(`gotoEventList: meet-id=${this.meet._id}, sessNum=${this.meet.session.number}`)
            this.$router.push( {name: 'events', params: {id: this.meet._id, num: this.meet.session.number}} )
        },
        gotoNextEvent() {
            console.log('need to go to next event ...')
            this.$store.dispatch('meet/getNextEvent').then ( (nextEvent) => {
                if (nextEvent) {
                    this.$router.push({ name: 'event', params: {id: nextEvent._id, event: nextEvent, loadlastheat: false} })
                }
                else {
                    this.gotoEventList()
                }
            })

        },
        gotoNextHeat() {
            this.heatIdx++
            this.heat = this.heats[this.heatIdx]
        },
        gotoPreviousEvent() {
            console.log('need to go to previous event ...')
            this.$store.dispatch('meet/getPrevEvent').then ( (prevEvent) => {
                if (prevEvent) {
                    this.$router.push({ name: 'event', params: {id: prevEvent._id, event: prevEvent, loadlastheat: true} })
                }
                else {
                    this.gotoEventList()
                }
            })
        },
        gotoPreviousHeat() {
            this.heatIdx--
            this.heat = this.heats[this.heatIdx]
        },
        async loadEvent() {
            console.log('Event.vue: dispatching meet/loadEvent')
            this.$store.dispatch('meet/loadEvent', {event: this.event})
                .then( (heats) => {
                    this.heats = heats
                    console.log(`back from dispatch, heats.length = ${this.heats.length}, load-last=${this.loadlastheat}`)
                    if (this.heats.length > 0) {
                        this.heatIdx = this.loadlastheat ? this.heats.length - 1 : 0
                        this.heat = this.heats[this.heatIdx]
                    }
                })
        },
        refresh() {
            console.log('refresh clicked')
        }
    },
    created() {
        console.log(`this.$route.params.id = ${this.$route.params.id}`)
        this.loadEvent()
    },
    watch: {
        '$route': 'loadEvent'
    }
}
</script>

<style scoped>

</style>

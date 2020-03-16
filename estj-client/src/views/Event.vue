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

        <relayHeat v-if="event.isRelay" :event="event" :heat="heat" :numLanes="numLanes"></relayHeat>
        <heat v-else :event="event" :heat="heat" :numLanes="numLanes"></heat>

        <v-row justify="space-between" class="mt-5">
            <v-btn @click="prevHeat" text>
                <v-icon left>mdi-arrow-left</v-icon>Prev Heat
            </v-btn>
            <v-btn text>Go To Event</v-btn>
            <v-btn @click="nextHeat" text>
                Next Heat<v-icon right>mdi-arrow-right</v-icon>
            </v-btn>
        </v-row>
    </v-container>
</template>

<script>
import heat from '../components/heat'
import relayHeat from '../components/relayHeat'
import { mapGetters } from 'vuex'
import { mapState } from 'vuex'
export default {
    name: 'Event',
    components: { heat, relayHeat },
    props: ['event'],
    data() {
        return {
            heat: {},        // the current heat of this event
            heats: [],       // array of heats
            heatIdx: 0       // current index into heats
        }
    },
    computed: {
        numberOfHeats: function() {return  this.heats ? this.heats.length : 0},
        ...mapGetters({
            // getEntriesByHeat: 'meet/getEntriesByHeat', // NEEDED???
            numLanes:         'meet/numLanes'
        }),
        ...mapState({
            // heats:        state => state.meet.activeEvent.heats,
            loading:      state => state.meet.loading,
            loadingError: state => state.meet.loadingError,
            meet:         state => state.meet.activeMeet
        })
    },
    filters: {
    },
    methods: {
        async loadEvent() {
            console.log('Event.vue: dispatching meet/loadEvent')
            this.$store.dispatch('meet/loadEvent', {event: this.event})
                .then( (heats) => {
                    this.heats = heats
                    console.log(`back from dispatch, heats.length = ${this.heats.length}`)
                    if (this.heats.length > 0) {
                        this.heat = this.heats[this.heatIdx]
                    }
                })
        },
        nextHeat() {
        },
        prevHeat() {
        }
    },
    created() {
        const event = this.$route.params.event
        if (event) console.log('created ... load event, ', event)
        else   console.log('created ... load event, no params.event')

        this.loadEvent()
    }
}
</script>

<style scoped>

</style>

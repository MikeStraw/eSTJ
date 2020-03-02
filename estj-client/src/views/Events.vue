<template>
    <v-container fluid>
        <v-row>
            <v-col>
                <h3>Event List</h3>
            </v-col>
        </v-row>
        <v-row>
            <v-col>
                <p v-if="loadingError" class="red--text text--darken-3 subheading">Error: {{loadingError}}</p>
                <p v-else-if="loading" class="blue-text">Loading meets from server ...</p>
                <p v-else-if="numEvents > 0">Click on an event to see the entries.</p>
                <p v-else class="font-italic"> No meets available.</p>
            </v-col>
        </v-row>
        <v-row>
            <v-col xs12 sm8 md6 lg4>
                <v-data-table :headers="headers"
                              :items="events"
                              :items-per-page="15"
                              @click:row="selectEvent">
                    <template v-slot:items="props">
                        <tr>
                            <td>{{props.item.number}}</td>
                            <td>{{props.item.desc}}</td>
                        </tr>
                    </template>
                </v-data-table>
            </v-col>
        </v-row>
    </v-container>
</template>

<script>
import { mapState } from 'vuex'
export default {
    name: 'Events',
    data() {
        return {
            meetId: '',
            sessionNum: '',
            headers: [
                {text: 'Evt. #', value: 'number', sortable: false},
                {text: 'Event Description', value: 'desc', sortable: false}
            ]
        }
    },
    computed: {
        numEvents: function() {return this.events ? this.events.length : 0},
        ...mapState({
            events:       state => state.meet.activeMeet.events,
            loading:      state => state.meet.loading,
            loadingError: state => state.meet.loadingError
        })
    },
    filters: {
    },
    methods: {
        async loadEvents() {
            console.log('Events.vue: dispatching meet/loadEvents')
            await this.$store.dispatch('meet/loadEvents', {meetId: this.meetId, sessionNum: this.sessionNum})
        },
        selectEvent(event){
            console.log(`selected event ... num=${event.number}, id=${event._id}`)
            // if (this.$store.dispatch('meet/setActiveEvent', event)) {
            //     this.$router.push({ name: 'event', params: {eventId: event._id} })
            // }
        }
    },
    created() {
        this.meetId = this.$route.params.id
        this.sessionNum = this.$route.params.num
        console.log(`created ... load events, id=${this.meetId}, num=${this.sessionNum}`)
        this.loadEvents()
    }
}
</script>

<style scoped>

</style>

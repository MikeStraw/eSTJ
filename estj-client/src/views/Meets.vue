<template>
    <v-container fluid>
        <v-row>
            <v-col>
                <h3>Meet List</h3>
            </v-col>
        </v-row>
        <v-row>
            <v-col>
                <p v-if="loadingError" class="red--text text--darken-3 subheading">Error: {{loadingError}}</p>
                <p v-else-if="loading" class="blue-text subtitle-2">Loading meet data from server ...</p>
                <p v-else-if="meets.length > 0">Click on a session to begin.</p>
                <p v-else class="font-italic"> No meets available.</p>
            </v-col>
        </v-row>

        <v-row v-for="meet in meets" :key="meet._id">
            <v-col>
                <v-card>
                    <v-card-title>
                        {{meet.name}}
                        <v-spacer></v-spacer>
                        {{meet.date | stripTime }}
                    </v-card-title>
                    <v-card-text>
                        <v-data-table
                                :headers="headers"
                                :items="meet.sessions"
                                @click:row="handleClick(meet)"
                                hide-default-footer
                        ></v-data-table>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>
    </v-container>
</template>

<script>
import {mapState} from 'vuex'

export default {
    name: 'Meets',
    data() {
        return {
            headers: [
                {text: 'Session #', value: 'number', sortable: false},
                {text: 'Session Name', value: 'name', sortable: false},
                {text: 'Day', value: 'day', sortable: false},
                {text: 'Time', value: 'time', sortable: false}
            ]
        }
    },
    computed: {
        ...mapState('meet', {
            loading:      state => state.loading,
            loadingError: state => state.loadingError,
            meets:        state => state.meets
        })
    },
    filters: {
        // strip the time and timezone info from timestamp string
        stripTime(value) {
            if (value.length > 10) return value.substring(0, 10)
            else                   return value
        }

    },
    methods: {
        handleClick(meet) {
            const sessIdx = event.target.parentNode.rowIndex
            const session = meet.sessions[sessIdx - 1]
            console.log(`found meet ${meet.name} and session number ${session.number}, pushing to events view`)
            this.$router.push( {name: 'events', params: {id: meet._id, num: session.number}} )
        },
        async loadMeets() {
            console.log('Meets.vue: dispatching meet/loadMeets')
            await this.$store.dispatch('meet/loadMeets')
        }
    },
    created() {
        this.loadMeets()
    }
}
</script>

<style scoped>

</style>

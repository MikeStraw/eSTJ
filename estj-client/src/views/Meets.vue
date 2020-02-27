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
                                @click:row="handleClick"
                                hide-default-footer
                        ></v-data-table>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>
    </v-container>
</template>

<script>
import apiSvc from '../services/api'

export default {
    name: 'Meets',
    data() {
        return {
            headers: [
                {text: 'Session #', value: 'number', sortable: false},
                {text: 'Session Name', value: 'name', sortable: false},
                {text: 'Day', value: 'day', sortable: false},
                {text: 'Time', value: 'time', sortable: false}
            ],
            loading: true,
            loadingError: '',
            meets: []
        }
    },
    filters: {
        // strip the time and timezone info from timestamp string
        stripTime(value) {
            if (value.length > 10) return value.substring(0, 10)
            else                   return value
        }

    },
    methods: {
        findMeetBySessionId(sessId) {
            for (let meet of this.meets) {
                let sessFound = meet.sessions.find( ({ _id }) => {return (_id  === sessId) } )
                if (sessFound) {
                    return meet
                }
            }
            return null
        },
        handleClick(session) {
            const meet = this.findMeetBySessionId(session._id)
            console.log(`found meet ${meet.name} and session number ${session.number}`)
        },
        async loadMeets() {
            try {
                const response = await apiSvc.getMeets()
                this.meets = response.data
                console.log(`/api/meets returns with meets.length = ${this.meets.length}`)
            }
            catch(error) {
                this.loadingError = error.response.data.error
            }
            finally {
                this.loading = false
            }
        }
    },
    created() {
        console.log('created ... need to load the meets')
        this.loadMeets()
    }
}
</script>

<style scoped>

</style>

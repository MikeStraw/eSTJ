<template>
    <v-container fluid>
        <h1>List of Meets Goes Here</h1>

        <p v-if="loading" class="blue--text subtitle-2" >
            Loading Meet Data ...
        </p>
        <p v-if="loadingError" class="red--text text--darken-3 subheading" >
            {{loadingError}}
        </p>

        <v-btn @click="logout">Log Out</v-btn>
    </v-container>
</template>

<script>
import axios from 'axios'
import tokenSvc from '../services/token'

export default {
    name: 'Meets',
    data() {
        return {
            loading: true,
            loadingError: ''
        }
    },
    methods: {
        async loadMeets() {
            this.loading = true

            const token = tokenSvc.getToken()
            axios.defaults.headers.common['Content-Type'] = 'application/json'
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
            axios( {
                method: 'get',
                url: 'http://localhost:3000/api/meets',
            }).then( (response) => {
                this.loading = false
                const meets = response.data
                console.log(`/api/meets returns with meets.length = ${meets.length}`)
            }).catch( (error) => {
                this.loading = false
                this.loadingError = error.response.data.error
            })
        },
        logout() {
            console.log('logout clicked')
            tokenSvc.removeToken()
            this.$store.dispatch('removeUser')
            this.$router.push( {name: 'login'} )
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
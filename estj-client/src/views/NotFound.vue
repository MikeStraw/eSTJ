<template>
<v-container>
    <h2>Sorry the page you requested cannot be found.</h2>
    <!--
        If logged in, route to list of events, else to login.
        Should verify that token is valid and not expired.
    -->
    <router-link v-if="isLoggedIn" :to="{ name: 'events' }">Back to the Event list.</router-link>
    <router-link v-else :to="{ name: 'login' }">Back to the Login Page</router-link>
</v-container>
</template>

<script>
//import tokenSvc from '../services/token';

export default {
    name: 'NotFound',
    data() {
        return {
            jwtToken: ''
        }
    },
    computed: {
        isLoggedIn() { return !!this.jwtToken}
    },
    created() {
        //this.jwtToken = tokenSvc.getTokenFromLocalStorage();
    }

}
</script>

<style scoped>

</style>

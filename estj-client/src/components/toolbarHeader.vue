<template>
    <v-app-bar
            app
            class="indigo"
            dark
    >
        <v-toolbar-title>
            <span class="display-1 font-weight-bold font-italic pr-5">Stroke & Turn Judge</span>
        </v-toolbar-title>

        <v-spacer></v-spacer>

        <div v-if="user">
            <span class="subheading pt-3">Welcome {{user.first}}
                <v-btn small text class="white--text" @click="logout">Log Out</v-btn>
            </span>
        </div>

    </v-app-bar>
</template>

<script>
import { mapState } from 'vuex'

export default {
    name: 'toolbarHeader',
    data: () => ({
    }),
    computed: {
        ...mapState('auth', {
            user: state => state.user
        })
    },
    methods: {
        logout() {
            console.log('stjHeader ... logout called.')
            this.$store.dispatch('auth/logout')
                .then( () => {
                    this.$router.push( {name: 'login'} )
                })
        }
    }

}
</script>

<style scoped>

</style>

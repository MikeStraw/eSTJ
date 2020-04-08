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
            <span class="subheading pt-3">Welcome {{user.first}}</span>

            <v-menu bottom left close-on-click close-on-content-click offset-y
                    transition="slide-y-transition">
                <template v-slot:activator="{ on }">
                    <v-btn icon v-on="on">
                        <v-icon>mdi-dots-vertical</v-icon>
                    </v-btn>
                </template>

                <v-list>
                    <v-list-item disabled @click="menuClick('A')">
                        <v-list-item-title>New Meet/Session</v-list-item-title>
                    </v-list-item>
                    <v-list-item disabled @click="menuClick('B')">
                        <v-list-item-title>Show DQs</v-list-item-title>
                    </v-list-item>
                    <v-divider></v-divider>
                    <v-list-item @click="logout">
                        <v-list-item-title>Log Out</v-list-item-title>
                    </v-list-item>
                </v-list>
            </v-menu>
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
        },
        menuClick(val) {
            console.log(`Menu clicked, val=${val}`)
        }
    }

}
</script>

<style scoped>

</style>

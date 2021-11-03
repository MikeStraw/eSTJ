<template>
    <v-card width="400" class="mx-auto mt-5">
        <v-card-title>
            <h1 class="display-1">Login to eSTJ</h1>
        </v-card-title>
        <v-card-text>
            <p>To log in, fill in all fields and click the submit button.</p>
            <v-form v-model="formValid">
                <v-text-field v-model.trim="form.firstname"
                              label="First Name"
                              :rules="formRules"
                              required
                />
                <v-text-field v-model.trim="form.lastname"
                              label="Last Name"
                              :rules="formRules"
                              required
                />
                <v-text-field v-model.trim="form.pin"
                              label="Pin"
                              :rules="formRules"
                              required
                />
            </v-form>
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions>
            <v-row>
                <v-col cols="3">
                    <v-btn :disabled="!formValid" color="success" @click="login">Login</v-btn>
                </v-col>
                <v-col cols="8">
                    <p v-if="authenticating" class="blue--text subtitle-2" >
                        Authenticating ...
                    </p>
                    <p v-if="authErrorCode" class="red--text text--darken-3 subheading" >
                        {{authErrorCode}} - {{authError}}
                    </p>
                </v-col>
            </v-row>
        </v-card-actions>
    </v-card>
</template>

<script>
import sseClient from '@/services/sseClient'
import {mapState} from 'vuex'

export default {
    name: 'login',
    data() {
        return {
            form: {
                firstname: '',
                lastname: '',
                pin: ''
            },
            formRules: [v => !!v || 'This is a required field'],
            formValid: false      // true if all required fields are filled in
        }
    },
    computed: {
        ...mapState('auth', {
            authenticating: state => state.authenticating,
            authError:      state => state.authError,
            authErrorCode:  state => state.authErrorCode
        })
    },
    methods: {
        async login() {
            console.log('login method called.')
            try {
                await this.$store.dispatch('auth/login', this.form)
                          .then( () => sseClient.connectToStream())
                await this.$router.push( {name: 'meets'} )
            }
            catch (err) {
                console.log(`Login.vue:  caught error ${err ? err : ''}`)
            }
        }
    }
}
</script>

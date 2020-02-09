<template>
    <v-card width="400" class="mx-auto mt-5">
        <v-card-title>
            <h1 class="display-1">Login to eSTJ</h1>
        </v-card-title>
        <v-card-text>
            <p>To log in, fill in all fields and click the submit button.</p>
            <v-form v-model="valid">
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
            <v-btn :disabled="!valid" color="success" @click="login">Login</v-btn>
        </v-card-actions>
    </v-card>
</template>

<script>
export default {
    name: 'login',
    data() {
        return {
            valid: false,      // true if all required fields are filled in
            form: {
                firstname: '',
                lastname: '',
                pin: ''
            },
            formRules: [v => !!v || 'This is a required field'],
            dataUpdates: 0
        }
    },
    computed: {
    },
    methods: {
        login() {
            console.log('login method called.')
        }
    }
}
</script>
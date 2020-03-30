<template>
    <div class="text-center">
        <v-dialog v-model="dialog" width="350">
            <template v-slot:activator="{ on }">
                <v-btn rounded color="red lighten-2" v-on="on">
                    Cancel DQ
                </v-btn>
            </template>

            <v-card>
                <v-card-title class="headline grey lighten-2" primary-title>
                    Remove This DQ?
                </v-card-title>

                <v-card-text>
                    Event #{{event.number}} - {{ event.desc }}<br />
                    Heat {{ heat.number }}, lane {{ lane }}
                </v-card-text>

                <v-divider></v-divider>

                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="primary" text @click="submitCancel">
                        Yes
                    </v-btn>
                    <v-btn color="primary" text @click="dialog = false">
                        No
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </div>
</template>

<script>
export default {
    name: 'dqCancel',
    props: {
        event: {type: Object, required: true},
        heat:  {type: Object, required: true},
        lane:  {type: Number, required: true}
    },
    data () {
        return {
            dialog: false,
        }
    },
    methods: {
        submitCancel() {
            const dqData = {action: 'cancel', lane: this.lane}
            this.dialog = false
            this.$emit('dq-cancel', dqData)
        }
    }
}
</script>

<style scoped>

</style>


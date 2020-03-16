<template>
    <div>
        <v-dialog persistent v-model="dialog" width="600" light>
            <template v-slot:activator="{ on }">
                <v-btn rounded color="red lighten-2" v-on="on">
                    DQ
                </v-btn>
            </template>

            <v-card outlined>
                <v-card-title>Submit DQ</v-card-title>
                <v-card-subtitle>
                    Event {{ event.number }}: {{ event.desc }}
                    <span class="float-right">Heat: {{ heat.number }}, Lane: {{ lane }}</span>
                </v-card-subtitle>
                <v-divider />
                <v-form v-model="form.valid" ref="dqForm">
                    <v-card-text>
                        <v-row >
                            <span class="mx-3 mt-5 subtitle-1">Reason: </span>
                            <v-checkbox v-model="form.reason.stroke" label="Stroke" class="mx-2" />
                            <v-checkbox v-model="form.reason.kick"   label="Kick"   class="mx-2" />
                            <v-checkbox v-model="form.reason.turn"   label="Turn"   class="mx-2" />
                            <v-checkbox v-model="form.reason.start"  label="Start"  class="mx-2" />
                            <v-checkbox v-model="form.reason.finish" label="Finish" class="mx-2" />
                        </v-row>

                        <v-row v-if="isRelay">
                            <span class="mx-3 mt-5 subtitle-1">Relay Leg: </span>
                            <v-checkbox v-model="form.relayLeg[1]" label="1" class="mx-2" />
                            <v-checkbox v-model="form.relayLeg[2]" label="2" class="mx-2" />
                            <v-checkbox v-model="form.relayLeg[3]" label="3" class="mx-2" />
                            <v-checkbox v-model="form.relayLeg[4]" label="4" class="mx-2" />
                        </v-row>

                        <v-row>
                            <v-textarea v-model="form.notes" label="DQ Notes" class="mx-3"/>
                        </v-row>
                    </v-card-text>

                    <v-card-actions>
                        <v-spacer />
                        <v-btn color="primary"  :disabled="! isValid" @click="submit">Submit</v-btn>
                        <v-btn color="secondary" @click="cancel">Cancel</v-btn>
                    </v-card-actions>
                </v-form>
            </v-card>
        </v-dialog>
    </div>

</template>

<script>
export default {
    name: 'dqDialog',
    props: {
        event: {type: Object, required: true},
        heat:  {type: Object, required: true},
        lane:  {type: Number, required: true}
    },
    data() {
        return {
            dialog: false,
            form: {
                notes: '',
                reason: {
                    finish: false,
                    kick: false,
                    start: false,
                    stroke: false,
                    turn: false
                },
                relayLeg: [false, false, false, false, false],  // legs 1 - 4
                valid: false
            }
        }
    },
    computed: {
        isRelay() { return this.event.isRelay},
        isValid() {
            const checkBoxes = this.form.reason.finish || this.form.reason.kick ||
                this.form.reason.start || this.form.reason.stroke || this.form.reason.turn
            const relayLegs = this.form.relayLeg.some( (leg) => leg === true)

            return checkBoxes || relayLegs || this.form.notes
        }
    },
    methods: {
        cancel() {
            this.dialog = false
            this.$refs.dqForm.reset()
            this.$emit('dq', {status: 'cancel', data: {}})
        },
        getDqData() {
            const dqData = { event: this.event.number, heat: this.heat.number, lane: this.lane }
            const reasonData = []
            for (let elem in this.form.reason) {
                if (this.form.reason[elem]) reasonData.push(`${elem}`)
            }

            const relayData = []
            this.form.relayLeg.map( (val, index) => {if (val) relayData.push(index) })

            if (reasonData.length > 0) { dqData.reason = reasonData.toString() }
            if (relayData.length > 0)  { dqData.relayLeg = relayData.toString()}
            if (this.form.notes)       { dqData.notes = this.form.notes }

            return dqData
        },
        submit() {
            const dqData = this.getDqData()
            this.dialog = false
            this.$refs.dqForm.reset()
            this.$emit('dq', {
                status: 'submit',
                data: dqData
            })
        }
    }
}
</script>

<style scoped>

</style>


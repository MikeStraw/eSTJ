<template>
    <v-simple-table>
        <template v-slot:default>
            <thead>
            <tr>
                <th>Lane</th>
                <th>Team</th>
                <th class="text-right">Seed</th>
                <th class="text-right">Final</th>
                <th> </th>
            </tr>
            </thead>
            <tbody>
            <tr :class="isDqd(index) ? 'custom-highlight-row' : '' "
                v-for="index in numLanes"
                :key="`lane-${index}`">
                <td>{{ index }}</td>
                <td>
                    {{ getTeam(index) }} {{ getRelayId(index) }}<br />
                    <small>
                        <span v-for="leg in 4"
                              :key="`leg-${leg}`"
                              class="pr-3">{{getNameByLeg(index, leg)}}</span>
                    </small>
                </td>
                <td class="text-right">{{ getSeedTime(index) }}</td>
                <td class="text-right">{{ getFinalTime(index) }}</td>
                <td>
                    <div v-if="isLaneOccupied(index)">
                        <dq-cancel v-if="isDqd(index)"
                                   @dq-cancel="onCancelDq" :event="event" :heat="heat" :lane="index"></dq-cancel>
                        <dq-dialog v-else
                                   @dq="onDq" :event="event" :heat="heat" :lane="index" />
                    </div>
                </td>
            </tr>
            </tbody>
        </template>
    </v-simple-table>
</template>

<script>
import dqDialog from './dqDialog'
import dqCancel from './dqCancel'
import heatMixin from '../mixins/heatMixin'

export default {
    name: 'relayHeat',
    components: { dqCancel, dqDialog },
    mixins: [heatMixin],
    props: {
        event: {type: Object, required: true},
        heat:  {type: Object, required: true},
        numLanes: {type: Number, required: true}
    },
    data() {
        return {
        }
    },
    methods: {
        getNameByLeg(lane, leg) {
            const entry = this.getEntryByLane(lane)
            const relay = entry.relay
            const idx = leg - 1

            if (relay && relay.athletes && relay.athletes.length > idx) {
                const name = relay.athletes[idx].fname + ' '  + relay.athletes[idx].lname
                return `${leg}) ${name}`
            }
            else {
                return ''
            }
        },
        getRelayId(lane) {
            const entry = this.getEntryByLane(lane)
            if (entry.relay && entry.relay.name) {
                return ` - ${entry.relay.name}`
            }
            else return ''
        }
    }
}
</script>

<style scoped>
    .custom-highlight-row{
        background-color: pink
    }
</style>


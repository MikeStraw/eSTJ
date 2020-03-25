<template>
    <v-simple-table>
        <template v-slot:default>
            <thead>
            <tr>
                <th>Lane</th>
                <th>Name</th>
                <th>Year</th>
                <th>School</th>
                <th class="text-right">Seed</th>
                <th class="text-right">Final</th>
                <th> </th>
            </tr>
            </thead>
            <tbody>
            <tr :class="isDqd(heat, index) ? 'custom-highlight-row' : '' "
                v-for="index in numLanes"
                :key="`lane=${index}`">
                <td>{{ index }}</td>
                <td>{{ getName(index) }}</td>
                <td>{{ getSchoolYear(index) }} </td>
                <td>{{ getTeam(index) }}</td>
                <td class="text-right">{{ getSeedTime(index) }}</td>
                <td class="text-right">{{ getFinalTime(index) }}</td>
                <td>
                    <div v-if="isLaneOccupied(index)">
                        <dq-cancel v-if="isDqd(heat, index)"
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
    name: 'heat',
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
    }
}
</script>

<style scoped>
    .custom-highlight-row{
        background-color: pink
    }
</style>


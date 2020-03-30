const mongoose = require('mongoose')
const Schema   = mongoose.Schema

const DqSchema = new Schema(
    {
        created:  {type: Date, default: Date.now},
        heat_id:  {type: String, required: true},
        user_id:  {type: String, required: true},
        lane:     {type: Number, required: true},
        notes:    {type: String, required: false},
        reason:   {type: String, required: true},
        relayLeg: {type: String, required: false}
    }
)

module.exports = mongoose.model('Dq', DqSchema)

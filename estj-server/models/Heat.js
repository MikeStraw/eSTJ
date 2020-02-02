const mongoose = require('mongoose')
const Entry    = require('./Entry')
const Schema   = mongoose.Schema

const HeatSchema = new Schema(
    {
        number:   {type: Number, required: true},
        event_id: {type: String, required: true},
        entries:  [Entry]
    }
)

module.exports = mongoose.model('Heat', HeatSchema)
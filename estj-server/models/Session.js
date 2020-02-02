const mongoose = require('mongoose')
const Schema   = mongoose.Schema

const SessionSchema = new Schema(
    {
        number: {type: Number, required: true, min: 1},
        name:   {type: String, required: true},
        day:    {type: Number, required: true, min: 1},
        time:   {type: String, required: true}
    }
)

module.exports = SessionSchema
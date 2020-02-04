const mongoose = require('mongoose')
const Athlete  = require('./Athlete')
const Schema   = mongoose.Schema

const RelaySchema = new Schema(
    {
        name:     {type: String, required: true},
        athletes: {type: Array, required: true}
    }
)

module.exports = RelaySchema
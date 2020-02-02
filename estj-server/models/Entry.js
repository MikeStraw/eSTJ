const mongoose = require('mongoose')
const Athlete  = require('./Athlete')
const Relay    = require('./Relay')
const Schema   = mongoose.Schema

const EntrySchema = new Schema(
    {
        lane:    {type: Number, required: true, min: 1},
        team:    {type: String, required: true},
        seed:    {type: String, default: 'NT'},
        final:   {type: String, default: ''},
        relay:   {type: Relay, required: false},  // will get a relay entry OR a athlete entry
        athlete: {type: Athlete, required: false}
    }
)

module.exports = EntrySchema
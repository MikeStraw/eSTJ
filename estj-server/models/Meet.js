const mongoose = require('mongoose')
const Session  = require('./session')
const Schema   = mongoose.Schema

const MeetSchema = new Schema(
    {
        date:     {type: Date},
        name:     {type: String, required: true},
        numLanes: {type: Number, required: true},
        sessions: [Session]
    }
);

module.exports = mongoose.model('Meet', MeetSchema)
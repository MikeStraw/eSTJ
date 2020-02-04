const mongoose = require('mongoose')
const Session  = require('./session')
const Schema   = mongoose.Schema

const MeetSchema = new Schema(
    {
        date:     {type: Date},
        name:     {type: String, required: true},
        numLanes: {type: Number, required: true},
        sessions: {type: Array,  required: true},
        type:     {type: String, required: true}
    }
)

MeetSchema.pre('findOneAndUpdate', function(next) {
    let options = this.getOptions()
    let update = this.getUpdate()
    if(options.upsert === true  &&  options.runValidators === true) {
        //console.log(`MeetSchema.requiredPaths=${MeetSchema.requiredPaths()}`)
        MeetSchema.requiredPaths().map(p => {
            if (typeof update[p] === 'undefined') {
                let str = `field '${p}' is required for the Meet Schema.`
                return next(new Error(str))
            }
        })
        // NOTE:  there has to be a better way to do this!!!
        const sessions = update.sessions
        for (session of sessions) {
            Session.requiredPaths().map(p => {
                if (typeof session[p] === 'undefined') {
                    let str = `field '${p}' is required for the Session Schema.`
                    return next(new Error(str))
                }
            })
        }
    }
    next()
})

module.exports = mongoose.model('Meet', MeetSchema)
const mongoose = require('mongoose')
const Schema   = mongoose.Schema

const EventSchema = new Schema(
    {
        desc:        {type: String, required: true},
        isRelay:     {type: Boolean, required: true},
        meet_id:     {type: String, required: true},
        number:      {type: Number, required: true},
        numLanes:    {type: Number, required: true},
        session_num: {type: Number, required: true}
    }
)

EventSchema.pre('findOneAndUpdate', function(next) {
    let options = this.getOptions()
    let update = this.getUpdate()
    if(options.upsert === true  &&  options.runValidators === true) {
        EventSchema.requiredPaths().map(p => {
            if (typeof update[p] === 'undefined') {
                let str = `field '${p}' is required for the EventSchema.`
                return next(new Error(str))
            }
        })
    }
    next()
})

module.exports = mongoose.model('Event', EventSchema)
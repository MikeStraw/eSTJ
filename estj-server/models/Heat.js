const mongoose = require('mongoose')
const Entry    = require('./Entry')
const Schema   = mongoose.Schema

const HeatSchema = new Schema(
    {
        number:   {type: Number, required: true},
        event_id: {type: String, required: true},
        entries:  {type: Array,  required: true}
    }
)

HeatSchema.pre('findOneAndUpdate', function(next) {
    let options = this.getOptions()
    let update = this.getUpdate()
    if(options.upsert === true  &&  options.runValidators === true) {
        HeatSchema.requiredPaths().map(p => {
            if (typeof update[p] === 'undefined') {
                let str = `field '${p}' is required for the Event Schema.`
                return next(new Error(str))
            }
        })
        // NOTE:  there has to be a better way to do this!!!
        const entries = update.entries
        const entryRequiredPaths = Entry.requiredPaths()
        for (entry of entries) {
            entryRequiredPaths.map(p => {
                if (typeof entry[p] === 'undefined') {
                    let str = `field '${p}' is required for the Entry Schema.`
                    return next(new Error(str))
                }
            })
        }
    }
    next()
})

module.exports = mongoose.model('Heat', HeatSchema)
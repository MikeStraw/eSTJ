const mongoose = require('mongoose')
const Schema   = mongoose.Schema

const UserSchema = new Schema(
    {
        created:   {type: Date, default: Date.now},
        first:     {type: String, required: true},
        last:      {type: String, required: true},
        lastLogin: {type: Date, required: true}
    }
)

UserSchema.pre('findOneAndUpdate', function(next) {
    let options = this.getOptions()
    let update  = this.getUpdate()
    if(options.upsert === true  &&  options.runValidators === true) {
        //console.log(`UserSchema.requiredPaths=${UserSchema.requiredPaths()}`)
        UserSchema.requiredPaths().map(p => {
            if (typeof update[p] === 'undefined') {
                let str = `field '${p}' is required for the User Schema.`
                return next(new Error(str))
            }
        })
    }
    next()
})

module.exports = mongoose.model('User', UserSchema)
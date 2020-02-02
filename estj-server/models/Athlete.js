const mongoose = require('mongoose')
const Schema   = mongoose.Schema

const AthleteSchema = new Schema(
    {
        age:        {type: Number, required: false},
        fname:      {type: String, required: true},
        lname:      {type: String, required: true},
        schoolYear: {type: String, required: false},
        teamName:   {type: String, required: true}
    }
)

module.exports = AthleteSchema
const mongoose = require('mongoose')

const LocationSchema = new mongoose.Schema({
    location: {
        type: String,
        required: true,
        unique: true
    },
    days:{
        type:[String],
        required: true
    },
    shifts:{
        type:[String],
        required:true
    }
})

const LocationModel = mongoose.model('Location', LocationSchema)

module.exports = LocationModel
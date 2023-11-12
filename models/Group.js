const mongoose = require('mongoose')

const GroupSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true,
        unique: true
    },
    notice:{
        type:String,
        default: null
    },
    text:{
        type:String,
        default: null
    }
})

const GroupModel = mongoose.model('Group', GroupSchema)

module.exports = GroupModel

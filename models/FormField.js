const mongoose = require('mongoose')

const FormFieldSchema = new mongoose.Schema({
    title:{
        type:String,
        required: true
    },
    group:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Group'
    },
    form:{
        type:String,
        required: true
    },
    answerDataType:{
        type:String,
        default : "text" // Yes-No, Files, Text,
    },
    hasRequiredDescription:{
        type: Boolean,
        required: true
    },
    requiredDescription:{
        type:String,
        required:true
    },
    whenToGetDescription:{
        type: Boolean,
        default: true
    }
})

const FormFieldModel = mongoose.model('FormField', FormFieldSchema)

module.exports = FormFieldModel

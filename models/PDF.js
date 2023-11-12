const mongoose = require('mongoose')

const PDFSchema = new mongoose.Schema({
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'User'
    },
    name:{
        type: String,
        required: true
    },
    link:{
        type: String,
        required: true
    },
    createdAt: {
        type: String,
        default: new Date().toISOString().split('T')[0]
    },
    time:{
        type: String,
        default: new Date().toISOString().split('T')[1]
    }
})

const PDFModel = mongoose.model('PDF', PDFSchema)

module.exports = PDFModel
const mongoose = require('mongoose')

const CarSchema = new mongoose.Schema({
    boardNumber:{
        type: String,
        required: true
    },
    privateNumber:{
        type:String,
        required: true
    },
    kilometers:{
        type:Number,
        required: true
    },
    currentKilometers:{
        type: Number,
        default:0
    },
    qrcode:{
        type:String,
        default:null
    }
})

const CarModel = mongoose.model('Car', CarSchema)

module.exports = CarModel

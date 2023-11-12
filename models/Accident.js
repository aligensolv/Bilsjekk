const mongoose = require('mongoose')

const AccidentSchema = new mongoose.Schema({
    boardNumber:{
        type: String,
        required: true
    },
    privateNumber:{
        type:String,
        required: true
    },
    createdAt:{
      type:String,
      default: new Date().toISOString().split('T')[0]
    },
    username:{
      type:String,
      required:true
    },
    pnid:{
      type:String,
      required: true
    },
    content:{
      type: String,
      required: true
    },
    time:{
      type: String,
      default: new Date().toISOString().split('T')[1]
    }
})

const AccidentModel = mongoose.model('Accident', AccidentSchema)

module.exports = AccidentModel
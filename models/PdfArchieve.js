const mongoose = require('mongoose')

const PDFArchieveSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true
  },
  accountId: {
    type: String,
    required: true,
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

const PDFArchieveModel = mongoose.model('PDFArchieve', PDFArchieveSchema)

module.exports = PDFArchieveModel
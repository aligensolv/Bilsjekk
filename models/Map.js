const mongoose = require('mongoose')

const mapSchema = new mongoose.Schema({

  data:{
    type: String,
    required: true
  },

  zone:{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Zone'
  },

  longitude:{
    type: Number,
    required: true
  },

  latitude:{
    type: Number,
    required: true
  }
})

const Map = mongoose.model('Map', mapSchema)

module.exports = Map
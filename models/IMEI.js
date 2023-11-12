const mongoose = require('mongoose');

const IMEISchema = new mongoose.Schema({
  serial: {
    type: String,
    required: true,
    unique:true
  },
  name:{
    type: String,
    default: null
  },
  zone:{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Zone',
  }
});

const IMEI = mongoose.model('IMEI', IMEISchema);

module.exports = IMEI;

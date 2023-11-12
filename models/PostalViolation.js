const mongoose = require('mongoose');

const postalViolationSchema = new mongoose.Schema({
  violationNumber:{
    type: String,
    required: true
  },
  pnid:{
    type: String,
    required: true
  },
  reason:{
    type: String,
    required: true
  },
  image:{
    type: String,
    required: true
  },
  link:{
    type: String,
    required: true
  },
  date:{
    type: String,
    default: new Date().toISOString().split('T')[0]
  },
  fullDate:{
    type: String,
    default: Date.now().toString()
  } 
});

const PostalViolation = mongoose.model('PostalViolation', postalViolationSchema);

module.exports = PostalViolation;

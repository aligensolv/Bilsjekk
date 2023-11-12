const mongoose = require('mongoose');

// Define the User schema
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  accountId: {
    type: String,
    required: true,
    unique: true
  },
  createdAt: {
    type: String,
    default: Date.now().toString()
  },
  password: {
    type: String,
    required: true
  },
});

// Define the User model
const User = mongoose.model('User', userSchema);

module.exports = User;

const mongoose = require('mongoose');

// Define the User schema
const managerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  username: {
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

  role:{
    type: String,
    default: 'manager'
  },

  permissions:[{
    route: String,
    method: String
  }]
});

// Define the User model
const Manager = mongoose.model('Manager', managerSchema);

module.exports = Manager;

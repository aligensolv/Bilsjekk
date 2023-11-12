const mongoose = require('mongoose')

const issueNotificationSchema = new mongoose.Schema({
  date:{
    type: String,
    required: true
  },
  title:{
    type: String,
    required: true
  },
  body:{
    type: String,
    required: true
  },

  type:{
    type: String,
    required: true
  }
})

const IssueNotificationModel = mongoose.model('IssueNotification',issueNotificationSchema)
module.exports = IssueNotificationModel
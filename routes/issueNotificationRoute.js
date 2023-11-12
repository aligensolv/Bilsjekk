const express = require('express')
const router = express.Router()
const IssueNotification = require('../models/IssueNotification')

router.get('/issueNotifications', async (req, res) => {
  try{
    let issueNotifications = await IssueNotification.find()
    return res.status(200).json(issueNotifications)
  }catch(err){
    return res.status(500).json(err.message)
  }
})

module.exports = router
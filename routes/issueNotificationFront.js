const express = require('express');
const router = express.Router();
const IssueNotification = require('../models/IssueNotification')
const jwt = require('jsonwebtoken')
const Manager = require('../models/Manager')

router.get('/issues/notifications', async (req, res) => {
    let jwt_access_token = req.cookies.jwt_token
    let decoded = jwt.verify(jwt_access_token,process.env.JWT_SECRET_KEY)
    let manager = await Manager.findOne({ _id: decoded.id })

    
    const issuenotifications = await IssueNotification.find()

    res.render('issueNotifications/index', { 
        issuenotifications: issuenotifications.reverse() ,
        isAdmin: decoded.role === 'admin',
        permissions: manager.permissions
    });
});

module.exports = router;
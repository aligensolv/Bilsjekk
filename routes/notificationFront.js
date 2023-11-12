const express = require('express')
const router = express.Router()
const NotificationModel = require('../models/NotificationModel')
const jwt = require('jsonwebtoken')
const Manager = require('../models/Manager')

router.get('/notifications',async (req,res) =>{
  try{
    let jwt_access_token = req.cookies.jwt_token
    let decoded = jwt.verify(jwt_access_token,process.env.JWT_SECRET_KEY)
    let manager = await Manager.findOne({ _id: decoded.id })

    let notifications = await NotificationModel.find()
    notifications = notifications.reverse()
    return res.status(200).render('notifications/read',{
      notifications,
      isAdmin: decoded.role === 'admin',
      permissions: manager.permissions
    })
  }catch(error){

  }
})


module.exports = router
const express = require('express')
const router = express.Router()
const Zone = require('../models/Zone')
const jwt = require('jsonwebtoken')
const Manager = require('../models/Manager')

router.get('/zones',async (req,res) =>{
  try{
    let jwt_access_token = req.cookies.jwt_token
    let decoded = jwt.verify(jwt_access_token,process.env.JWT_SECRET_KEY)
    let manager = await Manager.findOne({ _id: decoded.id })

    let zones = await Zone.find()
    return res.status(200).render('zones/index',{
      zones,
      isAdmin: decoded.role === 'admin',
      permissions: manager.permissions
    })
  }catch(error){
    return res.status(500).json(error.message)
  }
})

router.get('/zones/:id/edit',async (req,res) =>{
  try{
    let jwt_access_token = req.cookies.jwt_token
    let decoded = jwt.verify(jwt_access_token,process.env.JWT_SECRET_KEY)
    let manager = await Manager.findOne({ _id: decoded.id })

    let current = await Zone.findOne({ _id: req.params.id })
    return res.status(200).render('zones/edit',{
      zone: current,
      isAdmin: decoded.role === 'admin',
      permissions: manager.permissions
    })
  }catch(error){
    return res.status(500).json(error.message)
  }
})

router.get('/zones/new',async (req,res) =>{
  try{
    let jwt_access_token = req.cookies.jwt_token
    let decoded = jwt.verify(jwt_access_token,process.env.JWT_SECRET_KEY)
    let manager = await Manager.findOne({ _id: decoded.id })

    return res.status(200).render('zones/create',{
      isAdmin: decoded.role === 'admin',
      permissions: manager.permissions
    })
  }catch(error){
    return res.status(500).json(error.message)
  }
})

module.exports = router
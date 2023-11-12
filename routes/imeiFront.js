const express = require('express')
const router = express.Router()
const IMEI = require('../models/IMEI')
const jwt = require('jsonwebtoken')
const Manager = require('../models/Manager')

router.get('/imeis',async (req,res) =>{
  try{
    let jwt_access_token = req.cookies.jwt_token
    let decoded = jwt.verify(jwt_access_token,process.env.JWT_SECRET_KEY)
    let manager = await Manager.findOne({ _id: decoded.id })

    let imeis = await IMEI.find().populate({
      path: 'zone',
      ref: 'Zone'
    })
    
    return res.status(200).render('imeis/index',{
      imeis,
      isAdmin: decoded.role === 'admin',
      permissions: manager.permissions
    })
  }catch(error){
    return res.status(500).json(error.message)
  }
})

router.get('/imeis/:id/edit',async (req,res) =>{
  try{
    let jwt_access_token = req.cookies.jwt_token
    let decoded = jwt.verify(jwt_access_token,process.env.JWT_SECRET_KEY)
    let manager = await Manager.findOne({ _id: decoded.id })

    let current = await IMEI.findOne({ _id: req.params.id })
    return res.status(200).render('imeis/edit',{
      imei: current,
      isAdmin: decoded.role === 'admin',
      permissions: manager.permissions
    })
  }catch(error){
    return res.status(500).json(error.message)
  }
})

router.get('/imeis/new',async (req,res) =>{
  try{
    let jwt_access_token = req.cookies.jwt_token
    let decoded = jwt.verify(jwt_access_token,process.env.JWT_SECRET_KEY)
    let manager = await Manager.findOne({ _id: decoded.id })

    return res.status(200).render('imeis/create',{
      isAdmin: decoded.role === 'admin',
      permissions: manager.permissions
    })
  }catch(error){
    return res.status(500).json(error.message)
  }
})

module.exports = router
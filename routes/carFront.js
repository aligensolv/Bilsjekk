const express = require('express')
const router = express.Router()
const Car = require('../models/Car')
const jwt = require('jsonwebtoken')
const Manager = require('../models/Manager')
router.get('/cars', async (req,res) =>{
  try{
    let cars = await Car.find({})
    let jwt_access_token = req.cookies.jwt_token
    let decoded = jwt.verify(jwt_access_token,process.env.JWT_SECRET_KEY)
    let manager = await Manager.findOne({ _id: decoded.id })
    return res.status(200).render('car/index',{
      cars:cars,
      isAdmin: decoded.role === 'admin',
      permissions: manager.permissions
    })
  }catch (error){
    return res.send(`<h1>Internal Server Error 500</h1><br /> <h2>${error.message}</h2>`)
  }
})
// router.get('/cars/:id')
router.get('/cars/create', async (req,res) =>{
  let jwt_access_token = req.cookies.jwt_token
    let decoded = jwt.verify(jwt_access_token,process.env.JWT_SECRET_KEY)
    let manager = await Manager.findOne({ _id: decoded.id })
  return res.status(200).render('car/create',{
    isAdmin: decoded.role === 'admin',
      permissions: manager.permissions
  })
})

router.get('/cars/:id/update', async (req,res) =>{
  try{
    let jwt_access_token = req.cookies.jwt_token
    let decoded = jwt.verify(jwt_access_token,process.env.JWT_SECRET_KEY)
    let manager = await Manager.findOne({ _id: decoded.id })

    let car = await Car.findOne({ _id: req.params.id })
    return res.status(200).render('car/update',{
      car,
      isAdmin: decoded.role === 'admin',
      permissions: manager.permissions
    })
  }catch (error){
    return res.status(500).render('errors/internal',{
      error: error.message
    })
  }
})

router.get('/cars/:id/qrcode', async (req,res) =>{
  try{
    let car = await Car.findOne({ _id: req.params.id })
    let jwt_access_token = req.cookies.jwt_token
    let decoded = jwt.verify(jwt_access_token,process.env.JWT_SECRET_KEY)
    let manager = await Manager.findOne({ _id: decoded.id })

    return res.status(200).render('car/car_qrcode_view',{
      car,
      isAdmin: decoded.role === 'admin',
      permissions: manager.permissions
    })
  }catch (error){
    return res.status(500).render('errors/internal',{
      error: error.message
    })
  }
})
// router.get('/cars/update')

module.exports = router

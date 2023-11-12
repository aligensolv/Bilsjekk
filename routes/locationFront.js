const express = require('express')
const router = express.Router()
const Location = require('../models/Location')
const jwt = require('jsonwebtoken')
const Manager = require('../models/Manager')

router.get('/locations',async (req,res) =>{
    try{
        let jwt_access_token = req.cookies.jwt_token
    let decoded = jwt.verify(jwt_access_token,process.env.JWT_SECRET_KEY)
    let manager = await Manager.findOne({ _id: decoded.id })

        let locations = await Location.find({})
        return res.status(200).render('location/index',{
            locations,
            isAdmin: decoded.role === 'admin',
      permissions: manager.permissions
        })
    }catch (error){
        return res.status(500).render('errors/internal',{
            error: error.message
        })
    }
})

router.get('/locations/create',async (req,res) =>{
    let jwt_access_token = req.cookies.jwt_token
    let decoded = jwt.verify(jwt_access_token,process.env.JWT_SECRET_KEY)
    let manager = await Manager.findOne({ _id: decoded.id })

    return res.status(200).render('location/create',{
        isAdmin: decoded.role === 'admin',
      permissions: manager.permissions
    })
})

router.get('/locations/:id/update', async (req,res) =>{
    try{
        let jwt_access_token = req.cookies.jwt_token
    let decoded = jwt.verify(jwt_access_token,process.env.JWT_SECRET_KEY)
    let manager = await Manager.findOne({ _id: decoded.id })

        let location = await Location.findOne({ _id: req.params.id })
        return res.status(200).render('location/update',{
            location,
            isAdmin: decoded.role === 'admin',
      permissions: manager.permissions
        })
    }catch (error){
        return res.status(500).render('errors/internal',{
            error:error.message
        })
    }
})

module.exports = router
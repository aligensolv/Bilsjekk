const express = require('express')
const router = express.Router()
const User = require('../models/usersModel')
const jwt = require('jsonwebtoken')
const Manager = require('../models/Manager')


router.get('/users',async  (req,res) =>{
    try{
        let jwt_access_token = req.cookies.jwt_token
    let decoded = jwt.verify(jwt_access_token,process.env.JWT_SECRET_KEY)
    let manager = await Manager.findOne({ _id: decoded.id })
        let users = await User.find({})
        return res.status(200).render('users/read',{
            users: users,
            isAdmin: decoded.role === 'admin',
      permissions: manager.permissions
        })
    }catch (error){
        return res.status(500).json(error.message)
    }
})

router.get('/users/create', async (req,res) =>{
    let jwt_access_token = req.cookies.jwt_token
    let decoded = jwt.verify(jwt_access_token,process.env.JWT_SECRET_KEY)
    let manager = await Manager.findOne({ _id: decoded.id })
    return res.status(200).render('users/create',{
        isAdmin: decoded.role === 'admin',
      permissions: manager.permissions
    })
})

router.get('/users/:id/violations', async (req,res) =>{
    let jwt_access_token = req.cookies.jwt_token
    let decoded = jwt.verify(jwt_access_token,process.env.JWT_SECRET_KEY)
    let manager = await Manager.findOne({ _id: decoded.id })

    return res.status(200).render('users/violations',{
        accountId: req.params.id,
        isAdmin: decoded.role === 'admin',
      permissions: manager.permissions
    })
})

router.get('/users/:id/edit', async (req,res) =>{
    try{
        let jwt_access_token = req.cookies.jwt_token
    let decoded = jwt.verify(jwt_access_token,process.env.JWT_SECRET_KEY)
    let manager = await Manager.findOne({ _id: decoded.id })

        let user = await User.findOne({ _id: req.params.id })
        return res.status(200).render('users/update',{
            user: user,
            isAdmin: decoded.role === 'admin',
      permissions: manager.permissions
        })
    }catch (error){
        return res.status(500).json(error.message)
    } 
})

module.exports = router
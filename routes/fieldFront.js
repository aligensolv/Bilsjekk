const express = require('express')
const router = express.Router()
const axios = require('axios')
const FormField = require('../models/FormField')
const jwt = require('jsonwebtoken')
const Manager = require('../models/Manager')


router.get('/fields',async (req,res) =>{
    try{

        let jwt_access_token = req.cookies.jwt_token
    let decoded = jwt.verify(jwt_access_token,process.env.JWT_SECRET_KEY)
    let manager = await Manager.findOne({ _id: decoded.id })

        const formFields = await FormField.find({});
        return res.render('fields/index',{
            formFields: formFields,
            isAdmin: decoded.role === 'admin',
      permissions: manager.permissions
        })
    }catch (error){
        return res.render('errors/internal',{
            error:error.message
        })
    }
})
const Group = require('../models/Group')
router.get('/fields/create',async (req,res) =>{
    let jwt_access_token = req.cookies.jwt_token
    let decoded = jwt.verify(jwt_access_token,process.env.JWT_SECRET_KEY)
    let manager = await Manager.findOne({ _id: decoded.id })

    let groups = await Group.find({})
    return res.render('fields/create',{
        groups: groups,
        isAdmin: decoded.role === 'admin',
      permissions: manager.permissions
    })
})
router.get('/fields/:id/update', async (req,res) => {
    try{
        let jwt_access_token = req.cookies.jwt_token
    let decoded = jwt.verify(jwt_access_token,process.env.JWT_SECRET_KEY)
    let manager = await Manager.findOne({ _id: decoded.id })

        let formField = await FormField.findOne({_id:req.params.id})
        let groups = await Group.find({})
        return res.status(200).render('fields/edit',{
            formField,
            groups,
            isAdmin: decoded.role === 'admin',
      permissions: manager.permissions
        })
    }catch (error){
        return res.status(500).send(error.message)
    }
})

module.exports = router
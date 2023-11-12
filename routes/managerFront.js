const express = require('express')
const router = express.Router()
const Manager = require('../models/Manager')
const jwt = require('jsonwebtoken')

router.get('/managers', async (req, res) => {
    try {
        let jwt_access_token = req.cookies.jwt_token
        let decoded = jwt.verify(jwt_access_token,process.env.JWT_SECRET_KEY)
        let manager = await Manager.findOne({ _id: decoded.id })

        let managers = await Manager.find({})



        return res.status(200).render('managers/index', { 
            managers,
            isAdmin: decoded.role === 'admin',
      permissions: manager.permissions
         })
    }catch (err) {
        console.log(err.message);
        return res.status(500).json({ message: err.message });
    }
})

router.get('/managers/create', async (req, res) => {
    let jwt_access_token = req.cookies.jwt_token
    let decoded = jwt.verify(jwt_access_token,process.env.JWT_SECRET_KEY)
    let manager = await Manager.findOne({ _id: decoded.id })

    return res.render('managers/create',{
        isAdmin: decoded.role === 'admin',
      permissions: manager.permissions
    })
})

router.get('/managers/:id/update', async (req, res) => {
    try{
        let jwt_access_token = req.cookies.jwt_token
    let decoded = jwt.verify(jwt_access_token,process.env.JWT_SECRET_KEY)
    let manager_control = await Manager.findOne({ _id: decoded.id })

        let { id } = req.params
        let manager = await Manager.findById(id)
        return res.render('managers/update', {
            manager,
            managerPermissions: JSON.stringify(manager.permissions),

            isAdmin: decoded.role === 'admin',
            permissions: manager_control.permissions
        })
    }catch(e){
        console.log(e.message);
        ret = res.status(500).json({message: e.message});
    }
})

router.get('/managers/dashboard', async (req, res) => {
    try{
        let jwt_token = req.cookies.jwt_token
        let decoded = jwt.verify(jwt_token,process.env.JWT_SECRET_KEY)

        let manager = await Manager.findOne({ _id: decoded.id })
        let permissions = manager.permissions

        return res.render('managers/dashboard',{
            permissions
        })
    }catch(e){

    }
})

module.exports = router
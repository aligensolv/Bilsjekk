const express = require('express')
const router = express.Router()
const Manager = require('../models/Manager')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

router.post('/managers', async (req, res) => {
    try{
        const {
            username,
            name,
            password,
            role,
            permissions
        } = req.body

        const hashedPassword = await bcrypt.hash(password, 10);


        let manager = new Manager({
            username: username,
            name: name,
            password: hashedPassword,
            role: role,
            permissions: role == 'manager' ? permissions : [{
                route: 'machines',
                method: 'GET'
            }]
        })

        let saveManager = await manager.save()

        if(saveManager){
            return res.status(200).json({
                success: true
            })
        }else{
            return res.status(400).json({
                success: false,
                message: 'manager was not saved successfully'
            })
        }
    }catch(error){
        console.log(error.message);
        return res.status(500).json({error: error.message });
    }
})

router.delete('/managers/:id', async (req, res) => {
    try{
        const { id } = req.params
        const manager = await Manager.findOne({ _id: id })
        if(manager.role === 'admin'){
            return res.status(403).json({ 
                success: false,
                message: 'Admin can not be deleted, Forbidden'
            });
        }

        let isDeleted = await Manager.deleteOne({ _id: id })
        if (!isDeleted) {
            return res.status(304).json({
                success: false,
                message: 'manager was not deleted'
            })
        }

        return res.status(200).json({
            success: true,
            message: 'manager was deleted successfully'
        })
    }catch(e){
        return res.status(500).json({
            success: false,
            message: e.message
        })
    }
})


router.put('/managers/:id', async (req,res) =>{
    try{
        const { id } = req.params
        const jwt_access_token = req.cookies.jwt_token
        console.log(id);
        console.log(jwt_access_token);
        console.log(req.body);
        const {
            username,
            name,
            password,
            permissions,
        } = req.body

        const decoded = jwt.verify(jwt_access_token, process.env.JWT_SECRET_KEY)

        const manager = await Manager.findOne({ _id: id })
        if(manager.role === 'admin' && !decoded.role == 'admin'){
            return res.status(403).json({ 
                success: false,
                message: 'Admin can not be updated by manager, Forbidden'
            });
        }

        const hashedPassword = password == '' ? manager.password : await bcrypt.hash(password, 10);

        let isUpdated = await Manager.updateOne({
            _id: id
         },{ username, name, password: hashedPassword, permissions })
        if (!isUpdated) {
            return res.status(200).json({
                success: false,
                message: 'manager was not updated'
            })
        }

        return res.status(200).json({
            success: true,
            message: 'manager was deleted successfully'
        })
    }catch(e){

    }
})

module.exports = router
const express = require('express')
const router = express.Router()
const IssueCategory = require('../models/IssueCategory')
const jwt = require('jsonwebtoken')
const Manager = require('../models/Manager')
const Issue = require('../models/Issue')

router.get('/issues/categories', async (req, res) => {
    try{
        const categories = await IssueCategory.find({})
        let jwt_access_token = req.cookies.jwt_token
        let decoded = jwt.verify(jwt_access_token,process.env.JWT_SECRET_KEY)
        let manager = await Manager.findOne({ _id: decoded.id })

        return res.status(200).render('issues/categories',{
            categories: categories,
            isAdmin: decoded.role === 'admin',
            permissions: manager.permissions
        })
    }catch(err){
        return res.status(500).render('errors/internal')
    }
})

router.get('/issues/categories/create', async (req, res) => {
    try{
        let jwt_access_token = req.cookies.jwt_token
        let decoded = jwt.verify(jwt_access_token,process.env.JWT_SECRET_KEY)
        let manager = await Manager.findOne({ _id: decoded.id })
    
        return res.render('issues/categories_create',{
            isAdmin: decoded.role === 'admin',
                permissions: manager.permissions
        })
    }catch(err){
        return res.status(500).render('errors/internal',{
            error: err.message
        })
    }
})

router.get('/issues/categories/:id/update', async (req, res) => {
    let jwt_access_token = req.cookies.jwt_token
    let decoded = jwt.verify(jwt_access_token,process.env.JWT_SECRET_KEY)
    let manager = await Manager.findOne({ _id: decoded.id })

    const { id } = req.params
    let category = await IssueCategory.findOne({
        _id: id
    })

    return res.render('issues/categories_update',{
        isAdmin: decoded.role === 'admin',
        permissions: manager.permissions,
        category: category,
        problems: JSON.stringify(category.problems)
    })
})

router.get('/issues', async (req, res) => {
    let jwt_access_token = req.cookies.jwt_token
    let decoded = jwt.verify(jwt_access_token,process.env.JWT_SECRET_KEY)
    let manager = await Manager.findOne({ _id: decoded.id })

    let issues = await Issue.find({})

    return res.render('issues/index',{
        isAdmin: decoded.role === 'admin',
        permissions: manager.permissions,
        issues: issues.reverse()
    })
})


module.exports = router
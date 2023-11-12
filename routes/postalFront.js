const express = require('express')
const router = express.Router()
const Postal = require('../models/PostalViolation')
const jwt = require('jsonwebtoken')
const Manager = require('../models/Manager')

router.get('/postals',async (req,res) =>{
  try{
    let jwt_access_token = req.cookies.jwt_token
    let decoded = jwt.verify(jwt_access_token,process.env.JWT_SECRET_KEY)
    let manager = await Manager.findOne({ _id: decoded.id })

    let postals = await Postal.find()
    return res.status(200).render('postals/read',{
      postalViolations: postals,
      isAdmin: decoded.role === 'admin',
      permissions: manager.permissions
    })
  }catch(error){
    return res.status(500).json(error.message)
  }
})

router.get('/postals/:id', async (req, res) => {
  try {
    let jwt_access_token = req.cookies.jwt_token
    let decoded = jwt.verify(jwt_access_token,process.env.JWT_SECRET_KEY)
    let manager = await Manager.findOne({ _id: decoded.id })

      const postal = await Postal.findById(req.params.id);
      if (!postal) {
          return res.status(404).json({ error: 'PDF not found' });
      }
      let link = postal.link.split('.in')[1]
      return res.status(200).render('postals/postal_show', { 
        link,
        isAdmin: decoded.role === 'admin',
      permissions: manager.permissions
       });
  } catch (error) {
    console.log(error.message)
      return res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router
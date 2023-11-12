const express = require('express')
const router = express.Router()
const PostalScan = require('../models/PostalScan')
const jwt = require('jsonwebtoken')
const Manager = require('../models/Manager')

router.get('/scans',async (req,res) =>{
  try{
    let jwt_access_token = req.cookies.jwt_token
    let decoded = jwt.verify(jwt_access_token,process.env.JWT_SECRET_KEY)
    let manager = await Manager.findOne({ _id: decoded.id })

    let scans = await PostalScan.find()
    console.log(scans);
    return res.status(200).render('scans/read',{
      scans: scans,
      isAdmin: decoded.role === 'admin',
      permissions: manager.permissions
    })
  }catch(error){
    return res.status(500).json(error.message)
  }
})

router.get('/scans/:id', async (req, res) => {
  try {
    let jwt_access_token = req.cookies.jwt_token
    let decoded = jwt.verify(jwt_access_token,process.env.JWT_SECRET_KEY)
    let manager = await Manager.findOne({ _id: decoded.id })

      const scan = await PostalScan.findById(req.params.id);
      if (!scan) {
          return res.status(404).json({ error: 'PDF not found' });
      }
      let link = scan.link.split('.in')[1]
      return res.status(200).render('scans/postal_show', { 
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
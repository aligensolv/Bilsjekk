const express = require('express');
const router = express.Router();
const Machine = require('../models/Machine');
const jwt = require('jsonwebtoken')
const Manager = require('../models/Manager')

router.get('/machines', async (req, res) => {
    try {
      let jwt_access_token = req.cookies.jwt_token
    let decoded = jwt.verify(jwt_access_token,process.env.JWT_SECRET_KEY)
    let manager = await Manager.findOne({ _id: decoded.id })

      let machines = await Machine.find({}).populate([
        {
          path: 'zone',
          ref: 'Zone'
        },

        {
          path: 'categories',
          ref: 'IssueCategory'
        }
      ]);
  
      // Sort the machines array so that "inactive" machines come first
      machines.sort((a, b) => {
        if (a.status === 'inactive' && b.status !== 'inactive') {
          return -1;
        } else if (a.status !== 'inactive' && b.status === 'inactive') {
          return 1;
        }
        return 0; // If statuses are the same, maintain the current order
      });
  
      res.status(200).render('machines/index', { 
        machines: machines,
        isAdmin: decoded.role === 'admin',
      permissions: manager.permissions
       });
    } catch (err) {
      console.log(err.message);
      return res.status(500).json(err.message);
    }
  });
  

router.get('/machines/create', async (req, res) => {
    try{
      let jwt_access_token = req.cookies.jwt_token
    let decoded = jwt.verify(jwt_access_token,process.env.JWT_SECRET_KEY)
    let manager = await Manager.findOne({ _id: decoded.id })

        return res.status(200).render('machines/new',{
          isAdmin: decoded.role === 'admin',
      permissions: manager.permissions
        });
    }catch (err){
        console.log(err.message);
        return res.status(500).json(err.message);
    }
})

router.get('/machines/:id/edit', async (req, res) => {
    try{
      let jwt_access_token = req.cookies.jwt_token
    let decoded = jwt.verify(jwt_access_token,process.env.JWT_SECRET_KEY)
    let manager = await Manager.findOne({ _id: decoded.id })

        let machine = await Machine.findOne({ _id: req.params.id}).populate({
          path: 'categories',
          ref: 'IssueCategory'
        })
        return res.status(200).render('machines/edit', { 
          machine,
          jsMachine: JSON.stringify(machine),
          isAdmin: decoded.role === 'admin',
      permissions: manager.permissions
         });
    }catch(err){
        console.log(err.message);
        return res.status(500).json(err.message);
    }
})

router.get('/machines/:id/qrcode', async (req,res) =>{
    try{
      let jwt_access_token = req.cookies.jwt_token
    let decoded = jwt.verify(jwt_access_token,process.env.JWT_SECRET_KEY)
    let manager = await Manager.findOne({ _id: decoded.id })

      let machine = await Machine.findOne({ _id: req.params.id })
      return res.status(200).render('machines/machine_qrcode_view',{
        machine,
        isAdmin: decoded.role === 'admin',
      permissions: manager.permissions
      })
    }catch (error){
      return res.status(500).render('errors/internal',{
        error: error.message
      })
    }
  })


module.exports = router
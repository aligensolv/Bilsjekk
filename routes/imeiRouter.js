const express = require('express')
const router = express.Router()
const IMEI = require('../models/IMEI')

router.get('/imeis',async (req,res) =>{
  try{
    let imeis = await IMEI.find().populate({
      path: 'zone',
      ref: 'Zone'
    })
    return res.status(200).json(imeis)
  }catch(error){
    return res.status(500).json(error.message)
  }
})

router.post('/imeis',async (req,res) =>{
  try{
    let imei = new IMEI(req.body)
    await imei.save()
    return res.sendStatus(200)
  }catch(error){
    return res.status(500).json(error.message)
  }
})

router.put('/imeis/:id',async (req,res) =>{
  try{
    await IMEI.updateOne({ _id: req.params.id },req.body)
    return res.sendStatus(200)
  }catch(error){
    return res.status(500).json(error.message)
  }
})

router.delete('/imeis/:id',async (req,res) =>{
  try{
    await IMEI.deleteOne({ _id: req.params.id })
    return res.sendStatus(200)
  }catch(error){
    return res.status(500).json(error.message)
  }
})

router.delete('/imeis',async (req,res) =>{
  try{
    await IMEI.deleteMany({})
    return res.sendStatus(200)
  }catch(error){
    return res.status(500).json(error.message)
  }
})


module.exports = router
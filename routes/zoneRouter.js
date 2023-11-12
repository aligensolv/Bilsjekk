const express = require('express')
const router = express.Router()
const Zone = require('../models/Zone')

router.get('/zones',async (req,res) =>{
  try{
    let zones = await Zone.find()
    return res.status(200).json(zones)
  }catch(error){
    return res.status(500).json(error.message)
  }
})

router.post('/zones',async (req,res) =>{
  try{
    console.log(req.body)
    let zone = new Zone(req.body)
    await zone.save()
    return res.sendStatus(200)
  }catch(error){
    return res.status(500).json(error.message)
  }
})

router.put('/zones/:id',async (req,res) =>{
  try{
    await Zone.updateOne({ _id: req.params.id },req.body)
    return res.sendStatus(200)
  }catch(error){
    return res.status(500).json(error.message)
  }
})

router.delete('/zones/:id',async (req,res) =>{
  try{
    await Zone.deleteOne({ _id: req.params.id })
    return res.sendStatus(200)
  }catch(error){
    return res.status(500).json(error.message)
  }
})

router.delete('/zones',async (req,res) =>{
  try{
    await Zone.deleteMany({})
    return res.sendStatus(200)
  }catch(error){
    return res.status(500).json(error.message)
  }
})


module.exports = router
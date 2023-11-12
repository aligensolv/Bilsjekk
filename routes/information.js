const express = require('express')
const router = express.Router()
const fs = require('fs')
const path = require('path')

router.get('/info/car',async (req,res) =>{
  try{
    let applicationData = fs.readFileSync(path.join(__dirname,'../data/application.json'),{ 
      encoding: 'utf8',
      flag: 'r'
     })
     let applicationJson = JSON.parse(applicationData)

     return res.status(200).send(applicationJson.car)
  }catch(error){
    return res.status(500).send(error.message)
  }
})

router.get('/info/shift',async (req,res) =>{
  try{
    let applicationData = fs.readFileSync(path.join(__dirname,'../data/application.json'),{ 
      encoding: 'utf8',
      flag: 'r'
     })
     let applicationJson = JSON.parse(applicationData)
     console.log(applicationJson)

     return res.status(200).send(applicationJson.shift)
  }catch(error){
    console.log(error.message)
    return res.status(500).send(error.message)
  }
})

router.get('/info/kilometer',async (req,res) =>{
  try{
    let applicationData = fs.readFileSync(path.join(__dirname,'../data/application.json'),{ 
      encoding: 'utf8',
      flag: 'r'
     })
     let applicationJson = JSON.parse(applicationData)

     return res.status(200).send(applicationJson.kilometer)
  }catch(error){
    return res.status(500).send(error.message)
  }
})

const PDF = require('../models/PDF')
const User = require('../models/usersModel')
const Accident = require('../models/Accident')

router.get('/info/pdfs', async (req,res) =>{
  try{
    const count = await PDF.count();
    console.log(count)
    return res.status(200).json(count)
  }catch(error){
    console.log(error.message)
    return res.status(500).send(error.message)
  }
})

router.get('/info/users', async (req,res) =>{
  try{
    const count = await User.count();
    return res.status(200).json(count)
  }catch(error){
    console.log(error.message)
    return res.status(500).send(error.message)
  }
})

router.get('/info/accidents', async (req,res) =>{
  try{
    const count = await Accident.count();
    return res.status(200).json(count)
  }catch(error){
    console.log(error.message)
    return res.status(500).send(error.message)
  }
})

module.exports = router
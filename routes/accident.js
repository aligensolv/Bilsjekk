const express = require('express')
const router = express.Router()

const Accident = require('../models/Accident')

router.get('/accidents',async (req,res) =>{
  try{
    let accidents = await Accident.find({})
    return res.status(200).json(accidents)
  }catch(error){
    return res.status(500).error(error.message)
  }
})


module.exports = router
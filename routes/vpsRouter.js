const express = require('express')
const router = express.Router()

const {
  restartVPS,
  updateNordic,
  prepareBackup
} = require('../utils/vps_service')


router.get('/vps/restart',(req,res) =>{
  try{
    restartVPS()
    return res.sendStatus(200)
  }catch(error){
    console.log(error.message)
  }
})

router.get('/vps/update',(req,res) =>{
  try{
    updateNordic()
    return res.sendStatus(200)
  }catch(error){
    console.log(error.message)
  }
})

router.get('/vps/backup/prepare',async (req,res) =>{
  try{
    prepareBackup()
    return res.sendStatus(200)
  }catch(error){
    return res.status(500).send(error.message)
  }
})


module.exports = router
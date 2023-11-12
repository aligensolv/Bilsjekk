const express = require('express')
const router = express.Router()
const path = require('path')
const fs = require('fs')

router.put('/settings/credentials', async (req,res) =>{
  try{
    const { username,password } = req.body

    const data = JSON.stringify({
      username: username,
      password: password
    })
    fs.writeFileSync(path.join(__dirname,'../data/credentials.json'), data,{
      encoding:'utf-8'
    });
  
    return res.sendStatus(200)
  }catch(error){
    return res.status(500).send(error.message)
  }
})

router.put('/settings/emailTemplate', async (req,res) =>{
  try{
    const { subject,text } = req.body

    const data = JSON.stringify({
      subject: subject,
      text: text
    })
    fs.writeFileSync(path.join(__dirname,'../data/email.json'), data,{
      encoding:'utf-8'
    });
  
    return res.sendStatus(200)
  }catch(error){
    return res.status(500).send(error.message)
  }
})

router.put('/settings/smsTemplate', async (req,res) =>{
  try{
    const { text } = req.body

    const data = JSON.stringify({
      text: text,
    })
    fs.writeFileSync(path.join(__dirname,'../data/sms.json'), data,{
      encoding:'utf-8'
    });
  
    return res.sendStatus(200)
  }catch(error){
    return res.status(500).send(error.message)
  }
})

router.put('/settings/shift', async (req,res) =>{
  try{
    const { shift } = req.body

    let applicationData = fs.readFileSync(path.join(__dirname,'../data/application.json'),{ 
      encoding: 'utf8',
      flag: 'r'
     })
     let applicationJson = JSON.parse(applicationData)


    applicationJson.shift = shift
    fs.writeFileSync(path.join(__dirname,'../data/application.json'),JSON.stringify(applicationJson),{
      encoding:'utf-8'
    });
  
    return res.sendStatus(200)
  }catch(error){
    console.log(error.message)
    return res.status(500).send(error.message)
  }
})

router.put('/settings/car', async (req,res) =>{
  try{
    const { car } = req.body

    let applicationData = fs.readFileSync(path.join(__dirname,'../data/application.json'),{ 
      encoding: 'utf8',
      flag: 'r'
     })
     let applicationJson = JSON.parse(applicationData)


    applicationJson.car = car
    fs.writeFileSync(path.join(__dirname,'../data/application.json'),JSON.stringify(applicationJson),{
      encoding:'utf-8'
    });
  
    return res.sendStatus(200)
  }catch(error){
    console.log(error.message)
    return res.status(500).send(error.message)
  }
})

router.put('/settings/kilometer', async (req,res) =>{
  try{
    const { kilometer } = req.body

    let applicationData = fs.readFileSync(path.join(__dirname,'../data/application.json'),{ 
      encoding: 'utf8',
      flag: 'r'
     })
     let applicationJson = JSON.parse(applicationData)


    applicationJson.kilometer = kilometer
    fs.writeFileSync(path.join(__dirname,'../data/application.json'),JSON.stringify(applicationJson),{
      encoding:'utf-8'
    });
  
    return res.sendStatus(200)
  }catch(error){
    console.log(error.message)
    return res.status(500).send(error.message)
  }
})


module.exports = router

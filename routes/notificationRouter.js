const express = require('express')
const router = express.Router()
const NotificationModel = require('../models/NotificationModel')
const IMEI = require('../models/IMEI')
const admin = require('../utils/firebase');



router.post('/notifications/users', async (req,res) =>{
  try{
      const now = new Date();
      const localDate = new Date(now.getTime() + (now.getTimezoneOffset() * 60000));
      const localDateString = localDate.toISOString().split('T')[0];


      const message = {
          data: {
          title: req.body.title,
          body: req.body.body,
          type: 'users',
          },
          topic: 'nordic', // Replace with the topic you want to use
      };
      
      admin
          .messaging()
          .send(message)
          .then(async (response) => {
          console.log('Message sent:', response);
          let notification = new NotificationModel({
              title: req.body.title,
              body: req.body.body,
              date:localDateString,
              fullDate: localDate.toDateString()
          })
      
          await notification.save()
          })
          .catch((error) => {
          console.error('Error sending message:', error);
          });
            
      return res.sendStatus(200)
  }catch(error){
      console.log(error.message)
      return res.status(500).json(error.message)
  }
})


router.post('/notifications/zones', async (req,res) =>{
  try{
      const now = new Date();
      const localDate = new Date(now.getTime() + (now.getTimezoneOffset() * 60000));
      const localDateString = localDate.toISOString().split('T')[0];
 
      
      let imeis = await IMEI.find({
          zone: {
              $in: req.body.zones
          }
      })

      imeis = imeis.map(e =>{
          return e.serial
      })

      const message = {
          data: {
            title: req.body.title,
            body: req.body.body,
            type: 'zone',
            imeis: JSON.stringify(imeis)
          },
          topic: 'nordic', // Replace with the topic you want to use
        };
        
        admin
          .messaging()
          .send(message)
          .then(async (response) => {
            console.log('Message sent:', response);
            let notification = new NotificationModel({
              title: req.body.title,
              body: req.body.body,
              zones: req.body.zones,
              imeis:imeis,
              date:localDateString,
              fullDate: localDate.toDateString()
          })
      
          await notification.save()
          })
          .catch((error) => {
            console.error('Error sending message:', error);
          });
        
  
      return res.sendStatus(200)
  }catch(error){
      console.log(error.message)
      return res.status(500).json(error.message)
  }
})

router.post('/notifications/devices', async (req,res) =>{
  try{
      const now = new Date();
      const localDate = new Date(now.getTime() + (now.getTimezoneOffset() * 60000));
      const localDateString = localDate.toISOString().split('T')[0];
  
      const message = {
          data: {
            title: req.body.title,
            body: req.body.body,
            type: 'device',
            imei:JSON.stringify(req.body.imeis)
          },
          topic: 'nordic', // Replace with the topic you want to use
        };
        
        admin
          .messaging()
          .send(message)
          .then(async (response) => {
            console.log('Message sent:', response);
            let notification = new NotificationModel({
              title: req.body.title,
              body: req.body.body,
              zones: [],
              imeis:req.body.imeis,
              date:localDateString,
              fullDate: localDate.toDateString()
          })
      
          await notification.save()
          })
          .catch((error) => {
            console.error('Error sending message:', error);
          });
        
  
      return res.sendStatus(200)
  }catch(error){
      console.log(error.message)
      return res.status(500).json(error.message)
  }
})

router.get('/notifications',async (req,res) =>{
  try{
    let notifications = await NotificationModel.find()
    return res.status(200).json(notifications)
  }catch(error){
    return res.status(500).json(error.message)
  }
})

router.get('/notifications/imei/:id',async (req,res) =>{
  try{
    let { id } = req.params
    let notifications = await NotificationModel.find({
      imeis:{
        $in: [id,'*']
      }
    })

    return res.status(200).json(notifications)
  }catch(error){
    console.log(error.message)
    return res.status(500).json(error.message)
  }
})

router.get('/notifications/zones/:id',async (req,res) =>{
  try{
    let { id } = req.params
    let notifications = await NotificationModel.find({
      zones:{
        $in: [id]
      }
    })

    return res.status(200).json(notifications)
  }catch(error){
    return res.status(500).json(error.message)
  }
})



module.exports = router
const express = require('express')
const router = express.Router()
const Machine = require('../models/Machine')
const IssueNotification = require('../models/IssueNotification')
const Issue = require('../models/Issue')
const qrcode = require('qr-image')
const fs = require('fs')
const admin = require('../utils/firebase');
const moment = require('moment')


router.get('/machines', async (req, res) => {
    try{
        let machines = await Machine.find({}).populate([
            {
                path: 'zone',
                ref: 'Zone'
            },

            {
                path: 'categories',
                ref: 'IssueCategory'
            }
        ])
        return res.status(200).json(machines)
    }catch(err){
        console.log(err.message)
        return res.status(500).json({message: err.message});
    }
})

router.get('/machines/:id', async (req, res) => {
    try{
        let machine = await Machine.findOne({_id:req.params.id}).populate([
            {
                path: 'zone',
                ref: 'Zone'
            },

            {
                path: 'categories',
                ref: 'IssueCategory'
            }
        ])
        console.log(machine);
        return res.status(200).json(machine)
    }catch(err){
        console.log(err.message)
        return res.status(500).json({message: err.message});
    }
})


router.post('/machines', async (req, res) => {
    try{
        const { serial,zone,shiftNumber,zoneLocation,categories,latitude,longitude } = req.body
        let lastActiveTime = moment().format('YYYY-MM-DD HH:mm:ss')
        
        let machine = new Machine({
            serial,
            zone,
            zoneLocation,
            shiftNumber,
            categories,
            latitude,
            longitude,
            lastActiveTime: lastActiveTime
        })
        await machine.save()

        console.log(`klage.ryl.no/machines/${machine._id}`);
        const qrCodeImage = qrcode.image(`klage.ryl.no/machines/${machine._id}`, { type: 'png' });
        // Generate a unique filename
        const filename = `qrcode_${moment().format('YYYY-MM-DD')}.png`;
        const filePath = `public/qrcodes/${filename}`;

        const qrStream = qrCodeImage.pipe(fs.createWriteStream(filePath));

        qrStream.on('finish', () => {
            console.log(`QR Code saved as ${filename}`);
        });

        await Machine.updateOne({ _id: machine._id },{
            qrcode: process.env.BASE_URL  + `qrcodes/${filename}`
        })



        return res.status(200).json(machine)
    }catch(err){
        console.log(err.message)
        return res.status(500).json({message: err.message});
    }
})

router.put('/machines/:id', async (req, res) => {
    try{
        let machine = await Machine.updateOne({_id:req.params.id}, req.body)
        return res.status(200).json(machine)
    }catch(err){
        console.log(err.message)
        return res.status(500).json({message: err.message});
    }
})

router.delete('/machines/:id', async (req, res) => {
    try{
        let isDeleted = await Machine.deleteOne({_id:req.params.id})
        return res.status(200).json(isDeleted)
    }catch(err){
        console.log(err.message)
        return res.status(500).json({message: err.message});
    }
})

router.delete('/machines', async (req, res) => {
    try{
        let isDeleted = await Machine.deleteMany()
        return res.status(200).json(isDeleted)
    }catch(err){
        console.log(err.message)
        return res.status(500).json({message: err.message});
    }
})

router.post('/machines/:id/activate', async (req, res) => {
    try{
        let machine = await Machine.findOne({_id:req.params.id}).populate({
            path: 'zone',
            ref: 'Zone'
        })

        let machineActivation = await Machine.updateOne({
            _id:req.params.id
        },{
            status: 'active',
            lastActiveTime: moment().format('YYYY-MM-DD HH:mm:ss')
        })

        if(machineActivation){
            console.log('machine is activated again');
        }

        await Issue.updateMany({machine: req.params.id}, {
            status: 'complete'
        })

        let currentDate = moment().format('YYYY-MM-DD HH:mm:ss')

        const issueNotification = new IssueNotification({
            title: `P-Automat ${machine.serial} i orden`,
            body: `P-Automat på  ${machine.zone.name} i adressen ${machine.zoneLocation} er i orden`,
            date: currentDate,
            type: 'activation'
        })

        await issueNotification.save()

        const message = {
            data: {
                title: `P-Automat ${machine.serial} i orden`,
                body: `P-Automat på  ${machine.zone.name} i adressen ${machine.zoneLocation} er i orden`,
                type: 'issue_closed',
                id:req.params.id,
            },
            topic: 'nordic', // Replace with the topic you want to use
            android: {
                priority: "high"
            },
          };
          
          let response = await admin
            .messaging()
            .send(message)




        //    await sendAlertSMS({
        //         text: smsMessageFormatted,
        //         to: `4740088605`
        //         // to: `4747931499`
        //     })

        return res.status(200).json(true)
    }catch(err){
        console.log(err.message)
        return res.status(500).json({message: err.message});
    }
})

module.exports = router
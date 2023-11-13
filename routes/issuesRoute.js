const express = require('express');
const router = express.Router();
const IssueNotification = require('../models/IssueNotification')
const Issue = require('../models/Issue')
const User = require('../models/usersModel')
const IssueReport = require('../models/IssueReport');
const admin = require('../utils/firebase');
const { sendAlertSMS } = require('../utils/sms_service')
const Machine = require('../models/Machine')
const moment = require('moment');
const IssueCategory = require('../models/IssueCategory')
const Manager = require('../models/Manager')
const jwt = require('jsonwebtoken')
const SMS = require('../models/SMS')
const AppNotification = require('../models/AppNotification')

router.get('/issues/categories', async (req, res) => {
    try{
        const categories = await IssueCategory.find({})
        console.log(categories);
        return res.status(200).json(categories)
    }catch(err){
        console.log(err.message);
        return res.status(500).json(err.message)
    }
})

router.post('/issues/categories', async (req, res) => {
    try{
        const {
            name,
            importanceLevel,
            problems
        } = req.body

        const category = new IssueCategory({
            name: name,
            importanceLevel: importanceLevel,
            problems: problems
        })

        await category.save()

        return res.status(200).json(category)
    }catch(err){
        return res.status(500).json(err.message)
    }
})

router.delete('/issues/categories/:id', async (req, res) => {
    try{
        const {
            id
        } = req.params

        let isDeleted = await IssueCategory.deleteOne({
            _id: id
        })

        if(isDeleted){
            return res.status(200).json('deleted')
        }else{
            return res.status(404).json('issue category not found')
        }
    }catch(err){
        return res.status(500).json(err.message)
    }
})

router.delete('/issues/categories', async (req, res) => {
    try{

        await IssueCategory.deleteMany({})
        return res.status(200).json('All issue categories deleted')
    }catch(err){
        return res.status(500).json(err.message)
    }
})

router.put('/issues/categories/:id', async (req, res) => {
    try{
        const {
            id
        } = req.params

        const {
            name,
            importanceLevel,
            problems
        } = req.body

        let isUpdated = await IssueCategory.updateOne({
            _id: id
        },{ name,importanceLevel,problems })

        if(isUpdated){
            return res.status(200).json('updated')
        }else{
            return res.status(404).json('issue category not found')
        }
    }catch(err){
        return res.status(500).json(err.message)
    }
})

router.get('/issues/complete', async (req, res) => {
    try{
        let issues = await Issue.find({
            status: 'complete'
        })
        return res.status(200).json(issues.reverse())
    }catch(err){
        return res.status(500).json(err.message)
    }
})

router.get('/issues/current', async (req, res) => {
    try{
        let issues = await Issue.find({status: 'incomplete'})

        return res.status(200).json(issues.reverse())
    }catch(err){
        return res.status(500).json(err.message)
    }
})

router.get('/issues/waiting', async (req, res) => {
    try{
        let issues = await Issue.find({
            status: 'waiting'
        })
        return res.status(200).json(issues.reverse())
    }catch(err){
        return res.status(500).json(err.message)
    }
})

router.get('/issues/verified', async (req, res) => {
    try{
        let issues = await Issue.find({
            $or:[
                { status: 'redirected' },
                {
                    $and: [
                        { publisher: 'driver' },
                        {
                            status: 'incomplete'
                        },
                    ]
                }
            ]
        })
        return res.status(200).json(issues.reverse())
    }catch(err){
        return res.status(500).json(err.message)
    }
})


router.put('/issues/:id/waiting', async (req, res) => {
    try{
        const { id } = req.params
        const { reason } = req.body
        let issue = await Issue.findOne({ _id: id })
        let currentDate = moment(moment.now()).format('yyyy-MM-DD HH:mm:ss')

        issue.processes.push(`Issue is in waiting state at ${currentDate}`)
        issue.status = 'waiting'
        issue.statusText = reason
        issue.waitingStartTime = moment(currentDate).format('YYYY-MM-DD HH:mm:ss')
        issue.wasInWaitingState = true

        await issue.save()

        let newLastActiveTime = moment().format('YYYY-MM-DD HH:mm:ss')
        let machine = await Machine.findOne({
            _id: issue.machine
        })
        let lastActiveTime = moment(moment(machine.lastActiveTime).format('YYYY-MM-DD HH:mm:ss'))
        let currentTime = moment(moment().format('YYYY-MM-DD HH:mm:ss'))

        let diff = moment.duration(currentTime.diff(lastActiveTime,'hours'))
        let newTotalTime = machine.totalWorkingTime + +diff.asHours().toFixed(2)
        let machineId = issue.machine
        await Machine.updateOne({
            _id: machineId
        },{ status: 'waiting', lastActiveTime: newLastActiveTime, totalWorkingTime: newTotalTime})
        return res.status(200).json('moved to waiting')
    }catch(err){
        return res.status(500).json(err.message)
    }
})

router.delete('/issues/:id', async (req, res) => {
    try{

        let issue = await Issue.findOne({ _id: req.params.id })
        await Machine.updateOne({ _id: issue.machine },{
            'status': 'active',
        })
        await Issue.deleteOne({ _id: req.params.id })
        return res.status(200).json('deleted')
    }catch(err){
        return res.status(500).json(err.message)
    }
})

router.post('/issues', async (req, res) => {
    try{
        const {
            boardNumber,
            pnid,
            notes,
            id,
            category,
            problem,
            importanceLevel,
            publisher,
            phone
        } = req.body

        const machine = await Machine.findOne({
            _id: id
        }).populate({
            path: 'zone',
            ref: 'Zone'
        })

            let currentDate = moment(moment.now()).format('yyyy-MM-DD HH:mm:ss')


            const issueNotification = new IssueNotification({
                title: `Feil på ${machine.zoneLocation} Automat`,
                body: `Automat som ligger i adressen ${machine.zoneLocation} er ${problem},  klagen har kommet fra ${publisher == 'driver' ? 'pnid ' + pnid : publisher == 'admin' ? 'Drift' : 'skilt nr ' + boardNumber}`,
                date: currentDate,
                type: 'issue'
            })

            await issueNotification.save()

            const issue = new Issue({
                title: `Feil på Automat ${machine.zoneLocation}`,
                description: `Automat som ligger i adressen ${machine.zoneLocation}  er ${problem},  klagen har kommet fra ${publisher == 'driver' ? 'pnid ' + pnid : publisher == 'admin' ? 'Drift' : 'skilt nr ' + boardNumber}`,
                notes: notes ?? null,
                date: currentDate,
                machine: id ,
                serial: machine.serial,
                zone: machine.zone.name,
                zoneLocation: machine.zoneLocation,
                boardNumber: boardNumber,
                processes:[
                    `${publisher} uploaded issue at ${currentDate}`,
                ],
                category: category,
                problem: problem,
                importanceLevel: importanceLevel,
                publisher: publisher
            })

            if(publisher == 'driver'){
                issue.wasRedirected = true
                issue.redirectStartTime = moment(currentDate).format('YYYY-MM-DD HH:mm:ss')
            }


            await issue.save()

            const message = {
                data: {
                    title: `Feil på ${machine.zoneLocation} Automat`,
                    body: `Automat som ligger i adressen ${machine.zoneLocation} er ${problem},  klagen har kommet fra ${publisher == 'driver' ? 'pnid ' + pnid : publisher == 'admin' ? 'Drift' : 'skilt nr ' + boardNumber}`,
                    type: 'issue',
                    id:id,
                },
                topic: 'nordic', // Replace with the topic you want to use
              };
              
              let response = await admin
                .messaging()
                .send(message)


              const appNotification = await AppNotification.create({
                delivery_date: currentDate,
                content: `Automat som ligger i adressen ${machine.zoneLocation} er ${problem},  klagen har kommet fra ${publisher == 'driver' ? 'pnid ' + pnid : publisher == 'admin' ? 'Drift' : 'skilt nr ' + boardNumber}`,
                title: `Feil på ${machine.zoneLocation} Automat`,
              })
    
                console.log('Message sent:', response);

            if(publisher == 'client' && phone){
                console.log(phone);
                let smsMessageFormatted = 
`
Hei, 
Vi har mottatt din klager på ${machine.zoneLocation} og vi snart der for å fikse saken.

Takk for beskjed.
`
                await sendAlertSMS({
                    text: smsMessageFormatted,
                    to: phone.toString()
                    // to: `4747931499`
                })


                let smsMessage = new SMS({
                    delivery_date: currentDate,
                    delivered_to: [phone.toString()],
                    total_received: 1,
                    content: smsMessageFormatted,
                    about: 'notify client issue was received',
                })

                await smsMessage.save()
            }

                if(importanceLevel == 3 || importanceLevel == 2){
                    console.log('ok i was 2 or 3');
                    await sendAlertSMS({
                        text: `Automat som ligger i adressen ${machine.zoneLocation} er ${problem}  klagen har kommet fra ${publisher == 'driver' ? 'pnid ' + pnid : publisher == 'admin' ? 'Drift' : 'skilt nr ' + boardNumber}`,                    // to: `4747931499`
                        to: '4740088605'
                        // to: `4747931499`
                    })

                    await sendAlertSMS({
                        text: `Automat som ligger i adressen ${machine.zoneLocation} er ${problem}  klagen har kommet fra ${publisher == 'driver' ? 'pnid ' + pnid : publisher == 'admin' ? 'Drift' : 'skilt nr ' + boardNumber}`,                    // to: `4747931499`
                        // to: '4740088605'
                        to: `4747931499`
                    })

                    let delivery_date = moment().format('YYYY-MM-DD HH:mm:ss')

                    let smsMessage = new SMS({
                        delivery_date,
                        delivered_to: [
                            '4740088605',
                            '4747931499'
                        ],
                        total_received: 2,
                        content: `Automat som ligger i adressen ${machine.zoneLocation} er ${problem}  klagen har kommet fra ${publisher == 'driver' ? 'pnid ' + pnid : publisher == 'admin' ? 'Drift' : 'skilt nr ' + boardNumber}`,
                        about: 'notify about low or medium importance issue',
                    })
    
                    await smsMessage.save()
                }else if(importanceLevel == 1){
                    console.log('ok i was 1 and that is very serious');
                    await sendAlertSMS({
                        text: `Automat som ligger i adressen ${machine.zoneLocation} er ${problem}  klagen har kommet fra ${publisher == 'driver' ? 'pnid ' + pnid : publisher == 'admin' ? 'Drift' : 'skilt nr ' + boardNumber}`,                    // to: `4747931499`
                        // to: '4740088605'
                        to: `4747931499`
                    })

                    await sendAlertSMS({
                        text: `Automat som ligger i adressen ${machine.zoneLocation} er ${problem}  klagen har kommet fra ${publisher == 'driver' ? 'pnid ' + pnid : publisher == 'admin' ? 'Drift' : 'skilt nr ' + boardNumber}`,                    // to: `4747931499`
                        // to: '4740088605'
                        to: `4747931499`
                    })

                    await sendAlertSMS({
                        text: `Automat som ligger i adressen ${machine.zoneLocation} er ${problem}  klagen har kommet fra ${publisher == 'driver' ? 'pnid ' + pnid : publisher == 'admin' ? 'Drift' : 'skilt nr ' + boardNumber}`,                    // to: `4747931499`
                        to: '4740088605'
                        // to: `4747931499`
                    })

                    let delivery_date = moment().format('YYYY-MM-DD HH:mm:ss')

                    let smsMessage = new SMS({
                        delivery_date,
                        delivered_to: [
                            '4747931499',
                            '4747931499',
                            '4740088605',
                        ],
                        total_received: 3,
                        content: `Automat som ligger i adressen ${machine.zoneLocation} er ${problem},  klagen har kommet fra ${publisher == 'driver' ? 'pnid ' + pnid : publisher == 'admin' ? 'Drift' : 'skilt nr ' + boardNumber}`,
                        about: 'notify about high importance issue',
                    })
    
                    await smsMessage.save()
                }
                let newLastActiveTime = moment().format('YYYY-MM-DD HH:mm:ss')
        
                let lastActiveTime = moment(moment(machine.lastActiveTime).format('YYYY-MM-DD HH:mm:ss'))
                let currentTime = moment(moment().format('YYYY-MM-DD HH:mm:ss'))
        
                let diff = moment.duration(currentTime.diff(lastActiveTime))
                let newTotalTime = machine.totalWorkingTime + +diff.asHours().toFixed(2)

            await Machine.updateOne({
                _id:id,
            },{ status: 'inactive', totalWorkingTime: newTotalTime, lastActiveTime: newLastActiveTime })

            return res.json({ 
                message: 'Message sent successfully'
             })

    }catch(err){
        console.log(err.message)
        return res.status(500).json({message: err.message});
    }
})

const multer = require('multer')
const puppeteer = require('puppeteer')
const fs = require('fs')
const path = require('path')
const Handlebars = require('handlebars')
// Set up multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Set the destination folder where files will be saved
        cb(null, 'public/images/reports/'); // Create a folder named 'uploads' in your project root
    },
    filename: function (req, file, cb) {
        // Set the file name with original name + timestamp to make it unique
        cb(null, Date.now() + '_' + file.originalname);
    }
});

const upload = multer({ storage: storage });

router.post('/issues/:id/technician/reports', async (req, res) => {
    try{
        const { id } = req.params
        const { token } = req.headers

        let decoded = jwt.verify(token,process.env.JWT_SECRET_KEY)



        let currentIssue = await Issue.findOne({_id: id})
        let currentTech = await Manager.findOne({
            username: decoded.username
        })


        let currentDate = moment().format('YYYY-MM-DD HH:mm:ss')


        let issue = await Issue.findOne({ _id: id })
        issue.status = 'complete'
        issue.fixedAt = currentDate
        issue.processes.push(`issue was fixed and closed by ${currentTech.name} at ${currentDate}`)

        issue.fixedByIdentifier = currentTech.username
        issue.fixedBy = 'technician'

        if(issue.wasInWaitingState){
            issue.WaitingEndTime = currentDate
        }
        await issue.save()

        const browser = await puppeteer.launch({
            headless: 'new',
            args:['--no-sandbox']
        });
        const page = await browser.newPage();

        // Load the HTML template
        const htmlTemplate = fs.readFileSync('templates/machine_fix_report_tech.html', 'utf8');

        const now = new Date();
        const localDate = new Date(now.getTime() + (now.getTimezoneOffset() * 60000));
        const localDateString = localDate.toISOString().split('T')[0];

        // Replace placeholders with dynamic data
        const template_data = {
            clientNotes: currentIssue.notes,
            boardNumber:currentIssue.boardNumber,
            date: currentDate,
            serial: currentIssue.serial,
            zone: currentIssue.zone,
            zoneLocation: currentIssue.zoneLocation,
            username: currentTech.username,
            name: currentTech.name
        };

        const filledTemplate = Handlebars.compile(htmlTemplate)(template_data);
        let up_date = moment().format('YYYY-MM-DD')
        let filename = `technician_machine_fix_report_${up_date}.pdf`

        // Generate PDF from filled template
        await page.setContent(filledTemplate);
        await page.pdf({ path: `./public/profiles/${filename}`,
        
        printBackground: true,

        format: 'A3' });

        await browser.close();

        console.log('Issue updated and closed');

        let machineId = currentIssue.machine

        let machine = await Machine.findOne({
            _id: machineId
        })

        let newLastActiveTime = moment().format('YYYY-MM-DD HH:mm:ss')
        let newTotalTime = machine.totalOfflineTime

        let lastActiveTime = moment(moment(machine.lastActiveTime).format('YYYY-MM-DD HH:mm:ss'))
        let currentTime = moment(moment().format('YYYY-MM-DD HH:mm:ss'))

        let diff = moment.duration(currentTime.diff(lastActiveTime))
        newTotalTime = machine.totalOfflineTime + diff.asHours()

        let machineActivation = await Machine.updateOne({
            _id: machineId,
        },{
            status: 'active',
            lastActiveTime: newLastActiveTime,
            totalOfflineTime: newTotalTime
        })

        if(machineActivation){
            console.log('Machine activated');
        }

        const message = {
            data: {
                title: `P-Autmat ${currentIssue.zoneLocation} er i orden`,
                body: `P-Automat i adressen ${currentIssue.zoneLocation} fikset av ${currentTech.name}`,
                type: 'issue_closed',
            },
            topic: 'nordic', // Replace with the topic you want to use
          };
          
          let response = await admin
            .messaging()
            .send(message)

            const appNotification = await AppNotification.create({
                delivery_date: moment().format('YYYY-MM-DD HH:mm:ss'),
                title: `P-Autmat ${currentIssue.zoneLocation} er i orden`,
                content: ` P-Automat i adressen ${currentIssue.zoneLocation} fikset av ${currentTech.name}`
              })

            await sendAlertSMS({
                text: `P-Automat i adressen ${currentIssue.zoneLocation} fikset av ${currentTech.name}`,
                to: `4747931499`
                // to: '4740088605'
            })

            let delivery_date = moment().format('YYYY-MM-DD HH:mm:ss')

            let smsMessage = new SMS({
                delivery_date,
                delivered_to: [
                    '4747931499',
                ],
                content: `P-Automat i adressen ${currentIssue.zoneLocation} fikset av ${currentTech.name}`,
                total_received: 1,
                about: 'Technician uploads fix report',
            })

            await smsMessage.save()

            return res.status(200).json('issue was successfully closed');
    }catch(error){
        return res.status(500).json(error.message)
    }
})

router.post('/issues/:id/report', upload.single('report') ,async (req, res) => {
    console.log(req.params);
    try{
        const {
            details,
            notes,
            pnid
        } = req.body

        console.log(req.body);

        let image = process.env.BASE_URL + req.file.path.split('public')[1].replaceAll('\\','/')
        let currentIssue = await Issue.findOne({_id: req.params.id})
        const currentUser = await User.findOne({
            accountId: pnid,
        })

        let currentDate = moment().format('YYYY-MM-DD HH:mm:ss')


        const browser = await puppeteer.launch({
            headless: 'new',
            args:['--no-sandbox']
        });
        const page = await browser.newPage();

        // Load the HTML template
        const htmlTemplate = fs.readFileSync('templates/machine_fix_report.html', 'utf8');

        // Replace placeholders with dynamic data
        const template_data = {
            details: details,
            notes: notes ,
            clientNotes: currentIssue.notes,
            image,
            boardNumber:currentIssue.boardNumber,
            date: currentDate,
            serial: currentIssue.serial,
            zone: currentIssue.zone,
            zoneLocation: currentIssue.zoneLocation,
            pnid: currentUser.accountId,
            name: currentUser.name
        };

        const filledTemplate = Handlebars.compile(htmlTemplate)(template_data);
        let up_date = moment().format('YYYY-MM-DD')
        let filename = `machine_fix_report_${up_date}.pdf`

        // Generate PDF from filled template
        await page.setContent(filledTemplate);
        await page.pdf({ path: `./public/profiles/${filename}`,
        
        printBackground: true,

        format: 'A3' });

        await browser.close();

        const issueReport = new IssueReport({
            details: details,
            notes: notes,
            date: currentDate,
            image: image,
            pdf: process.env.BASE_URL + 'profiles/' + filename,
            serial: currentIssue.serial,
            zone: currentIssue.zone,
            zoneLocation: currentIssue.zoneLocation
        })

        await issueReport.save()

        const issueNotification = new IssueNotification({
            title: `P-Autmat ${currentIssue.zoneLocation} er i orden`,
            body: ` P-Automat i adressen ${currentIssue.zoneLocation} fikset av ${currentUser.name}`,
            date: currentDate,
            type: 'activation'
        })

        await issueNotification.save()

        let issue = await Issue.findOne({ _id: req.params.id })
        issue.status = 'complete'
        issue.fixedAt = currentDate
        issue.processes.push(`issue was fixed and closed by ${currentUser.name} at ${currentDate}`)
        issue.fixedByIdentifier = currentUser.accountId
        issue.fixedBy = 'driver'

        if(issue.wasInWaitingState){
            issue.WaitingEndTime = moment(currentDate).format('YYYY-MM-DD HH:mm:ss') 
        }
        await issue.save()

        console.log('Issue updated and closed');

        let machineId = currentIssue.machine
        let machine = await Machine.findOne({
            _id: machineId
        })

        let newLastActiveTime = moment().format('YYYY-MM-DD HH:mm:ss')
        let newTotalTime = machine.totalOfflineTime

        let lastActiveTime = moment(moment(machine.lastActiveTime).format('YYYY-MM-DD HH:mm:ss'))
        let currentTime = moment(moment().format('YYYY-MM-DD HH:mm:ss'))

        let diff = moment.duration(currentTime.diff(lastActiveTime))
        newTotalTime = machine.totalOfflineTime + diff.asHours()

        let machineActivation = await Machine.updateOne({
            _id: machineId,
        },{
            status: 'active',
            lastActiveTime: newLastActiveTime,
            totalOfflineTime: newTotalTime
        })

        if(machineActivation){
            console.log('Machine activated');
        }

        const message = {
            data: {
                title: `P-Autmat ${currentIssue.zoneLocation} er i orden`,
                body: ` P-Automat i adressen ${currentIssue.zoneLocation} fikset av ${currentUser.name}`,
                type: 'issue_closed',
            },
            topic: 'nordic', // Replace with the topic you want to use
          };
          
          let response = await admin
            .messaging()
            .send(message)

            const appNotification = await AppNotification.create({
                delivery_date: currentDate,
                content: ` P-Automat i adressen ${currentIssue.zoneLocation} fikset av ${currentUser.name}`,
                title: `P-Autmat ${currentIssue.zoneLocation} er i orden`,
              })

            await sendAlertSMS({
                text: `P-Automat i adressen ${currentIssue.zoneLocation} fikset av ${currentUser.name}`,
                to: `4747931499`
                // to: '4740088605'
            })


            let delivery_date = moment().format('YYYY-MM-DD HH:mm:ss')

            let smsMessage = new SMS({
                delivery_date,
                delivered_to: [
                    '4747931499',
                ],
                content: `P-Automat i adressen ${currentIssue.zoneLocation} fikset av ${currentUser.name}`,
                total_received: 1,
                about: 'User Upload Fix Report',
            })

            await smsMessage.save()

        return res.status(200).json({ message: 'PDF generated and saved successfully' });
    }catch(err){
        console.log(err.message)
        return res.status(500).json({message: err.message});
    }
})

router.post('/issues/:id/external/notify', async (req,res) =>{
    try{
        const { reason } = req.body

        const issue = await Issue.findOne({
            _id: req.params.id
        })

        let currentDate = moment(moment.now()).format('yyyy-MM-DD HH:mm:ss')

        issue.processes.push(`issue couldn't be fixed and notified managers at ${currentDate}`)
        issue.status = 'redirected'
        issue.statusText = reason

        issue.redirectStartTime = currentDate
        issue.wasRedirected = true
        await issue.save()

        let smsMessageFormatted = `
Feil på P-Automat ${issue.serial}  på ${issue.zoneLocation} ute av drift.

Den trenger teknikker.
Grunn: ${reason}
        `

        await sendAlertSMS({
            text: smsMessageFormatted,
            // to: `4740088605`
            to: `4747931499`
        })

        await sendAlertSMS({
            text: smsMessageFormatted,
            to: `4740088605`
            // to: `4747931499`
        })

        let delivery_date = moment().format('YYYY-MM-DD HH:mm:ss')

        let smsMessage = new SMS({
            delivery_date,
            delivered_to: [
                '4747931499',
                '4740088605'
            ],
            content: smsMessageFormatted,
            total_received: 2,
            about: 'issue redirected by driver',
        })

        await smsMessage.save()

        let drivers = [
            '4745078525',
            '4746428404',
            '4799564631',
            '4791171227',
            '4748641582',
            '4792073338',
            '4748663198',
            '4798619269',
            '4797300429',
            '4799587640',
            '4746330028',
            '4799866900',
            '4748346050',
            '4740730294',
            '4740747706',
            '4748421818',
            '4740088605',
            '4745492045',
            '4795885836',
            '4747380151'
        ]
        let driversFormattedMessage = 
`
Hei,
Ikke kontroll på ${issue.zoneLocation} til nærmere beskjed.

Drift, Parknordic
`

for(let driver of drivers){
    await sendAlertSMS({
        text: driversFormattedMessage,
        to: driver
    })
}

let smsAnotherMessage = new SMS({
    delivery_date,
    delivered_to: drivers,
    content: driversFormattedMessage,
    total_received: drivers.length,
    about: 'issue redirected by driver',
})

await smsAnotherMessage.save()

        return res.status(200).json({message: smsMessageFormatted})
    }catch(error){
        console.log(error.message)
        return res.status(500).json({message: error.message});
    }
})
module.exports = router;

const fs = require('fs')
const PDF = require('../models/PDF')
const Violation = require('../models/Violation')
const jwt = require('jsonwebtoken')
const User = require('../models/usersModel')
const Handlebars = require('handlebars')
const puppeteer = require('puppeteer')
const Car = require('../models/Car')
const Accident = require('../models/Accident')
const path = require('path')
const SMS = require('../models/SMS')
const moment = require('moment')


const { sendAlertMail } = require('../utils/smtp_service')
const { sendAlertSMS } = require('../utils/sms_service')
const { storeArchieve } = require('./pdf_archieve_controller')



const createNewDriver = async (req,res) =>{
    try{
        const { data, token } = req.headers
        const information = JSON.parse(decodeURIComponent(data))

        let decodedToken = jwt.verify(token,process.env.JWT_SECRET_KEY)
        let user = await User.findOne({ _id: decodedToken.userId })


        if(information.carId != undefined){
            let existingCar = await Car.findOne({ _id: information.carId })

            if(+information.kilometers + +existingCar.currentKilometers >= +existingCar.kilometers){
       
                console.log('in if')
                let emailData = fs.readFileSync(path.join(__dirname,'../data/email.json'),{ 
                    encoding: 'utf8',
                    flag: 'r'
                })
                
                let emailJson = JSON.parse(emailData)
                let emailSubject = emailJson.subject
                .replace(/{private}/g, information.privateNumber)
                .replace(/{board}/g, information.boardNumber)
                .replace(/{pnid}/g, user.accountId)
                .replace(/{kilometers}/g, existingCar.kilometers);
    
                let emailText = emailJson.text
                .replace(/{private}/g, information.privateNumber)
                .replace(/{board}/g, information.boardNumber)
                .replace(/{pnid}/g, user.accountId)
                .replace(/{kilometers}/g, existingCar.kilometers);
    
    
                sendAlertMail({
                    // to:'me@mutaz.no',
                    to:"vaktleder@parknordic.no",
                    // to:"alitarek99944@gmail.com",
                    subject: emailSubject,
                    text: emailText,
                    html: `<h2>${emailText}</h2>`                    
                })
    
                let smsData = fs.readFileSync(path.join(__dirname,'../data/sms.json'),{ 
                    encoding: 'utf8',
                    flag: 'r'
                })
                
                let smsJson = JSON.parse(smsData)
                let smsText = smsJson.text
                .replace(/{private}/g, information.privateNumber)
                .replace(/{board}/g, information.boardNumber)
                .replace(/{pnid}/g, user.accountId)
                .replace(/{kilometers}/g, existingCar.kilometers);
    
                console.log(smsText)
    
                await sendAlertSMS({
                    text: smsText,
                    to:"4747931499"
                    // to:'4740088605'
                });
    
                let delivery_date = moment().format('YYYY-MM-DD HH:mm:ss')
                let sms = new SMS({
                    delivery_date,
                    delivered_to: '4747931499',
                    content: smsText,
                    total_received: 1,
                    about: 'exceeded car kilometers',
                })
                await Car.updateOne({ _id: information.carId },{
                    kilometers:0,
                    currentKilometers:0
                })
            }
                else{
                    console.log(information)
                    await Car.updateOne({ _id: information.carId },{
                        currentKilometers: existingCar.currentKilometers + information.kilometers
                    })
                }
        }


        let values = Object.values(req.body).map(e => JSON.parse(decodeURIComponent(e)))

        const groupedData = values.reduce((acc, obj) => {
            if (!acc[obj.form]) {
                acc[obj.form] = [];
            }

            acc[obj.form].push(obj);
            return acc;
        }, {});


        const browser = await puppeteer.launch({
            headless: 'new',
            args:['--no-sandbox']
        });
        const page = await browser.newPage();

        // Load the HTML template
        const htmlTemplate = fs.readFileSync('templates/driver.html', 'utf8');
    


        const groupedImages = {};

        for (const image of req.files) {
            const fieldname = decodeURIComponent(image.fieldname);
            if (!groupedImages[fieldname]) {
                groupedImages[fieldname] = [];
            }
            groupedImages[fieldname].push({
                path: process.env.BASE_URL + image.path.split('public')[1].replaceAll('\\','/'),
            });
        }


        // Replace placeholders with dynamic data
        const template_data = {
            location: information.locations,
            car: information.boardNumber + "  " + information.privateNumber,
            shift: information.day + " - " + information.period,
            violations: information.trafficViolations,
            date: information.date,
            user: user.name + ' - ' + user.accountId,
            rows: [...groupedData['First'],...groupedData['Second']].map(e => {
                return {
                    title: e.title,
                    status: e.value != 'Ja' && e.value != 'Nei' ? (e.whenToGetDescription ? 'Ja' : 'Nei') : e.value,
                    notes: e.value != 'Ja' && e.value != 'Nei' ? e.value : 'XXX',
                    positive: e.value != 'Ja' && e.value != 'Nei' ? 'red' : 'green'
                };
            }),
            groupedImages:groupedImages,
        };

        const filledTemplate = Handlebars.compile(htmlTemplate)(template_data);
        let currentDate = moment().format('YYYY-MM-DD');
        let currentTime = moment().format('HH:mm:ss');


        let filename = `Betjent_${user.accountId}_${currentDate}.pdf`

        // Generate PDF from filled template
        await page.setContent(filledTemplate);
        await page.pdf({ path: `./public/profiles/${filename}`,
        
        printBackground: true,

        format: 'A3' });

        let pdf = new PDF({
            name: filename,
            link: process.env.BASE_URL + 'profiles/' + filename,
            userId: decodedToken.userId,
            createdAt: currentDate,
            time: currentTime,
        })

        await pdf.save()
        console.log(`PDF saved: ${process.env.BASE_URL + 'profiles/' + filename}`);
        
        await storeArchieve({
            id: decodedToken.userId,
            pdfData:{
                name: filename,
                link: process.env.BASE_URL + 'profiles/' + filename,
                createdAt:currentDate,
                time:currentTime
            }
        })

        let violation = new Violation({
            username:user.name,
            accountId:user.accountId,
            violations:eval(information.trafficViolations),
            removed:Number.isNaN(+information.trafficViolations.split('-')[1]) ? 0 : +information.trafficViolations.split('-')[1],
            createdAt:currentDate,
            time:currentTime
        })

        await violation.save()

        let filteredWanted = groupedData['First'].filter(e => {
            return e.title.includes('Lakk/bulker/merker')
        })

        console.log(`filtered wanted value is ${filteredWanted[0].value}`);

        if((filteredWanted[0].value != 'Ja' && filteredWanted[0].value != 'Nei') && information.carId != undefined){
            let existingCar = await Car.findOne({ _id: information.carId })

            let accident = new Accident({
                username:user.name,
                pnid:user.accountId,
                boardNumber: existingCar.boardNumber,
                privateNumber: existingCar.privateNumber,
                content:filteredWanted[0].value,
                createdAt: currentDate,
                time: currentTime
            })

            await accident.save()
        }


        await browser.close();
        return res.status(200).json({ message: 'PDF generated and saved successfully' });
    }catch (error){
        console.log(error.message)
        return res.status(500).send(error.message)
    }
}


module.exports = { createNewDriver }
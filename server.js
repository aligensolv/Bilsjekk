require('dotenv').config()
require('./utils/mongodbConnection')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')
const Manager = require('./models/Manager')


const express = require('express')
const app = express()


const bodyParser = require('body-parser')
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

const cookieParser = require('cookie-parser');
app.use(cookieParser())

const cors = require('cors')
app.use(cors({
    origin: '*'
}))

app.use(express.static(__dirname + '/public'));
app.set('view engine', 'ejs')

app.get('/login', (req,res) =>{
    return res.status(200).render('auth/login')
})


app.get('/rp', async (req, res) => {
    return res.status(200).render('issues/create_issue')
})


const PDFArchieve = require('./models/PdfArchieve')

app.get('/archieve',async (req,res) =>{
    let jwt_access_token = req.cookies.jwt_token
    let decoded = jwt.verify(jwt_access_token,process.env.JWT_SECRET_KEY)
    let manager = await Manager.findOne({ _id: decoded.id })

    let archieves = await PDFArchieve.find({})
    return res.status(200).render('pdfArchieve/pdf_list',{
        pdfs: archieves,
        isAdmin: decoded.role === 'admin',
      permissions: manager.permissions
    })
})

const PDF = require('./models/PDF')
app.post('/api/archieves', async (req,res) =>{
    try{
        let pdfs = await PDF.find({})

        for(let pdf of pdfs){
            try{
                let pop = await pdf.populate({
                    path: 'userId',
                    ref: 'User'
                })
                
                if(pdf == null){
                    continue
                }
    
                let isExisting = await PDFArchieve.findOne({
                    accountId: pdf.userId.accountId,
                    link:pdf.link,
                    createdAt:pdf.createdAt
                })
    
                if(!isExisting){
                    continue;
                }
    
                let archieve = new PDFArchieve({
                    name:pdf.name,
                    username:pdf.userId.name,
                    accountId:pdf.userId.accountId,
                    link:pdf.link,
                    createdAt:pdf.createdAt,
                })
    
                await archieve.save()
            }catch(err){
                continue
            }
        }

        return res.sendStatus(200) 
    }catch(error){
        return res.status(500).json(error.message)
    }
})

// READ - Get a specific PDF by ID
app.get('/archieves/:id', async (req, res) => {
    try {
        let jwt_access_token = req.cookies.jwt_token
    let decoded = jwt.verify(jwt_access_token,process.env.JWT_SECRET_KEY)
    let manager = await Manager.findOne({ _id: decoded.id })

        const pdf = await PDFArchieve.findById(req.params.id);
        if (!pdf) {
            return res.status(404).json({ error: 'PDF not found' });
        }
        let link = pdf.link.split('.in')[1]
        return res.status(200).render('pdfArchieve/pdf_show.ejs', { 
            link,
            isAdmin: decoded.role === 'admin',
      permissions: manager.permissions
         });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});

app.get('/admin/api/logout',(req,res) =>{

    res.cookie('is_logged',{
        expires: Date.now()
    })

    res.cookie('jwt_token',{
        expires: Date.now()
    })

    return res.redirect('/')
})

const path = require('path')

app.post('/admin/api/login', async (req,res) =>{
    const { username, password } = req.body
    const manager = await Manager.findOne({ username });

    if (!manager) {
      return res.status(404).json({ error: 'Manager not found' });
    }

    const isMatch = await bcrypt.compare(password, manager.password);

    if (isMatch) {
      const token = jwt.sign(
        { 
            id: manager._id,
            role: manager.role,
        },
        process.env.JWT_SECRET_KEY
      );

        // Cookie expiration time in milliseconds (3 hours in this case)
        res.cookie('is_logged','true',{
            maxAge: 1000 * 60 * 60 * 3, 
            httpOnly: true,
        })

        // Cookie expiration time in milliseconds (3 hours in this case)
        res.cookie('jwt_token', token,{
            maxAge: 1000 * 60 * 60 * 3,
            httpOnly: true,
        })  

        return res.status(200).json({
            role: manager.role,
            permissions: manager.permissions
        })
    } else {
      return res.status(401).json('Invalid password');
    }
})

const { authorize_front, authorize_admin_api } = require('./middlewares/authorize');



const driverRouter = require('./routes/driverRoute')
const groupRouter = require('./routes/groupRoute')
const fieldRouter = require('./routes/fieldRoute')

const userRouter = require('./routes/usersRouter')
const pdfRouter = require('./routes/pdfRoute')
const carRouter = require('./routes/carRoute')
const locationRouter = require('./routes/locationRoute')
const settingsRouter = require('./routes/settingsRoute')
const violationRouter = require('./routes/violationRoute')
const informationRouter = require('./routes/information')
const accidentRouter = require('./routes/accident')
const vpsRouter = require('./routes/vpsRouter')
const zoneRouter = require('./routes/zoneRouter')
const imeiRouter = require('./routes/imeiRouter')
const postalRouter = require('./routes/postalRoute')
const mapRouter = require('./routes/mapRouter')
const notificationRouter = require('./routes/notificationRouter')
const scanRouter = require('./routes/scanRoute')
const machinesRouter = require('./routes/machinesRoute')
const issueNotificationRouter = require('./routes/issueNotificationRoute')
const issuesRouter = require('./routes/issuesRoute')
const reportRouter = require('./routes/reportRoute')
const issueReportRouter = require('./routes/issueReportRoute')


app.use(
    '/api',
    vpsRouter,
    reportRouter,
    issuesRouter,
    issueNotificationRouter,
    machinesRouter,
    scanRouter,
    notificationRouter,
    mapRouter,
    postalRouter,
    violationRouter,
    accidentRouter,
    informationRouter,
    driverRouter,
    settingsRouter,
    groupRouter,
    fieldRouter,
    userRouter,
    pdfRouter,
    carRouter,
    locationRouter,
    imeiRouter,
    zoneRouter,
    issueReportRouter
    )
    

    const managerRoute = require('./routes/managerRoute')

app.use(
    '/admin/api',
    authorize_admin_api,
    managerRoute,
    vpsRouter,
    reportRouter,
    issuesRouter,
    issueNotificationRouter,
    machinesRouter,
    scanRouter,
    notificationRouter,
    mapRouter,
    postalRouter,
    violationRouter,
    accidentRouter,
    informationRouter,
    driverRouter,
    settingsRouter,
    groupRouter,
    fieldRouter,
    userRouter,
    pdfRouter,
    carRouter,
    locationRouter,
    imeiRouter,
    zoneRouter,
    issueReportRouter
    )

const driverFront = require('./routes/driverFront')
const groupFront = require('./routes/groupFront')
const fieldFront = require('./routes/fieldFront')
const pdfFront = require('./routes/pdfFront')
const usersFront = require('./routes/usersFront')
const carFront = require('./routes/carFront')
const locationFront = require('./routes/locationFront')
const settingsFront = require('./routes/settingsFront')
const zonesFront = require('./routes/zonesFront')
const imeiFront = require('./routes/imeiFront')
const postalFront = require('./routes/postalFront')
const mapFront = require('./routes/mapFront')
const notificationFront = require('./routes/notificationFront')
const scanFront = require('./routes/scanFront')
const machineFront = require('./routes/machinesFront')
const issueNotificationFront = require('./routes/issueNotificationFront')
const issueReportFront = require('./routes/issueReportFront')
const managerFront = require('./routes/managerFront')
const issuesFront = require('./routes/issuesFront')

const authenticate_front = require('./middlewares/authenticate');



app.use(
    authenticate_front,
    authorize_front,
    issuesFront,
    mapFront,
    managerFront,
    scanFront,
    issueNotificationFront,
    notificationFront,
    issueReportFront,
    machineFront,
    settingsFront,
    driverFront,
    postalFront,
    groupFront,
    fieldFront,
    pdfFront,
    usersFront,
    carFront,
    locationFront,
    zonesFront,
    imeiFront
)


const Violation = require('./models/Violation');
app.get('/',async (req,res) =>{
    let violations = await Violation.find({});

const combinedViolations = violations.reduce((result, v) => {
    const existingEntry = result.find(entry => entry.date === v.createdAt);
    if (existingEntry) {
        existingEntry.value += v.violations;
    } else {
        result.push({
            date: v.createdAt,
            value: v.violations
        });
    }
    return result;
}, []);

    console.log(combinedViolations)

    const violationsJSON = JSON.stringify(combinedViolations);

    return res.status(200).render('index',{
        violations: violationsJSON
    })
})

app.get('*', (req, res) => {
    return res.render('errors/404')
})

const port = process.env.port || 3000
app.listen(port, () => console.log(`Server is running on http://localhost:${3000}`))


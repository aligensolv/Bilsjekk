const express = require('express')
const router = express.Router()
const Postal = require('../models/PostalViolation')
const PostalScan = require('../models/PostalScan')
const Handlebars = require('handlebars')
const puppeteer = require('puppeteer')
const multer = require('multer')
const path = require('path')
const fs = require('fs')

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/images/drivers/')
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname)
  },
})

const upload = multer({ 
  storage: storage
})

router.get('/postals',async (req,res) =>{
  try{
    let postals = await Postal.find()
    return res.status(200).json(postals)
  }catch(error){
    return res.status(500).json(error.message)
  }
})

router.post('/postals',upload.single('violation'),async (req,res) =>{
  

  try{
    console.log(req.body)
    const {
      number,
      pnid,
      reason
    } = req.body

    const browser = await puppeteer.launch({
      headless: 'new',
      args:['--no-sandbox']
    });
    const page = await browser.newPage();

    // Load the HTML template
    const htmlTemplate = fs.readFileSync('templates/postal.html', 'utf8');
    
    const now = new Date();
    const localDate = new Date(now.getTime() + (now.getTimezoneOffset() * 60000));
    const localDateString = localDate.toISOString().split('T')[0];

    // Replace placeholders with dynamic data
    const template_data = {
      pnid: pnid,
      number: number,
      reason: decodeURIComponent(reason),
      date: localDateString,
      image: process.env.BASE_URL + req.file.path.split('public')[1].replaceAll('\\','/')
    
      
  };
  const filledTemplate = Handlebars.compile(htmlTemplate)(template_data);
  let filename = `post_${pnid}_${localDateString}.pdf`
  
  // Generate PDF from filled template
  await page.setContent(filledTemplate);
  await page.pdf({ 
    path: `./public/postals/${filename}`,
    printBackground: true,
    format: 'A0',
  });
    let postal = new Postal({
      violationNumber: number,
      pnid: pnid,
      date: localDateString,
      reason: decodeURIComponent(reason),
      link: process.env.BASE_URL + 'postals/' + filename,
      image: process.env.BASE_URL + req.file.path.split('public')[1].replaceAll('\\','/')
    })

    console.log(postal);


    await postal.save()
    await browser.close();
    return res.sendStatus(200)
  }catch(error){
    console.log(error.message)
    return res.status(500).json(error.message)
  }
})

router.put('/postals/:id',async (req,res) =>{
  try{
    await Postal.updateOne({ _id: req.params.id },req.body)
    return res.sendStatus(200)
  }catch(error){
    return res.status(500).json(error.message)
  }
})

router.delete('/postals/:id',async (req,res) =>{
  try{
    await Postal.deleteOne({ _id: req.params.id })
    return res.sendStatus(200)
  }catch(error){
    return res.status(500).json(error.message)
  }
})

router.delete('/postals',async (req,res) =>{
  try{
    await Postal.deleteMany({})
    return res.sendStatus(200)
  }catch(error){
    return res.status(500).json(error.message)
  }
})


module.exports = router
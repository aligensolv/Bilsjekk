const express = require('express')
const router = express.Router()
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

const upload = multer({ storage: storage })

router.get('/scans',async (req,res) =>{
  try{
    let scans = await PostalScan.find()
    return res.status(200).json(scans)
  }catch(error){
    return res.status(500).json(error.message)
  }
})

router.post('/scans',upload.single('violation'),async (req,res) =>{
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
    const htmlTemplate = fs.readFileSync('templates/scan.html', 'utf8');
    


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
  let filename = `makul_${pnid}_${localDateString}.pdf`

  // Generate PDF from filled template
  await page.setContent(filledTemplate);
  await page.pdf({ path: `./public/postals/${filename}`,
  
  printBackground: true,

  format: 'A0' });
    let postal = new PostalScan({
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
    console.log(error.message);
    return res.status(500).json(error.message)
  }
})

router.put('/scans/:id',async (req,res) =>{
  try{
    await PostalScan.updateOne({ _id: req.params.id },req.body)
    return res.sendStatus(200)
  }catch(error){
    return res.status(500).json(error.message)
  }
})

router.delete('/scans/:id',async (req,res) =>{
  try{
    await PostalScan.deleteOne({ _id: req.params.id })
    return res.sendStatus(200)
  }catch(error){
    return res.status(500).json(error.message)
  }
})

router.delete('/scans',async (req,res) =>{
  try{
    await PostalScan.deleteMany({})
    return res.sendStatus(200)
  }catch(error){
    return res.status(500).json(error.message)
  }
})


module.exports = router
const express = require('express');
const router = express.Router();
const PDF = require('../models/PDF');
const jwt = require('jsonwebtoken')
const Manager = require('../models/Manager')


// CREATE - Create a new PDF
router.post('/pdfs', async (req, res) => {
    try {
        const { name, link } = req.body;
        const newPDF = new PDF({ name, link });
        await newPDF.save();
        return res.status(201).json(newPDF);
    } catch (error) {
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});

// READ - Get all PDFs
router.get('/pdfs', async (req, res) => {
    try {
        let jwt_access_token = req.cookies.jwt_token
    let decoded = jwt.verify(jwt_access_token,process.env.JWT_SECRET_KEY)
    let manager = await Manager.findOne({ _id: decoded.id })

        const pdfs = await PDF.find({}).populate({
            path:'userId',
            ref:'User'
        });
        return res.status(200).render('pdf/pdf_list', { 
            pdfs:pdfs.reverse(), 
            isAdmin: decoded.role === 'admin',
      permissions: manager.permissions
        });
    } catch (error) {
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});

// READ - Get a specific PDF by ID
router.get('/pdfs/:id', async (req, res) => {
    try {
        let jwt_access_token = req.cookies.jwt_token
    let decoded = jwt.verify(jwt_access_token,process.env.JWT_SECRET_KEY)
    let manager = await Manager.findOne({ _id: decoded.id })

        const pdf = await PDF.findById(req.params.id);
        if (!pdf) {
            return res.status(404).json({ error: 'PDF not found' });
        }
        let link = pdf.link.split('.in')[1]
        return res.status(200).render('pdf/pdf_show.ejs', { 
            link,
            isAdmin: decoded.role === 'admin',
      permissions: manager.permissions
         });
    } catch (error) {
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});

// READ - Get a specific PDF by ID
router.get('/pdfs/:id/edit', async (req, res) => {
    try {
        let jwt_access_token = req.cookies.jwt_token
    let decoded = jwt.verify(jwt_access_token,process.env.JWT_SECRET_KEY)
    let manager = await Manager.findOne({ _id: decoded.id })

        const pdf = await PDF.findById(req.params.id);
        if (!pdf) {
            return res.status(404).json({ error: 'PDF not found' });
        }
        return res.status(200).render('pdf/pdf_edit', { 
            pdf,
            isAdmin: decoded.role === 'admin',
      permissions: manager.permissions
         });
    } catch (error) {
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});

// UPDATE - Update an existing PDF by ID
router.put('/pdf/:id', async (req, res) => {
    try {
        const { name, link } = req.body;
        const updatedPDF = await PDF.findByIdAndUpdate(
            req.params.id,
            { name, link },
            { new: true }
        );
        if (!updatedPDF) {
            return res.status(404).json({ error: 'PDF not found' });
        }
        return res.status(200).json(updatedPDF);
    } catch (error) {
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});

// DELETE - Delete a PDF by ID
router.delete('/pdf/:id', async (req, res) => {
    try {
        const deletedPDF = await PDF.findByIdAndDelete(req.params.id);
        if (!deletedPDF) {
            return res.status(404).json({ error: 'PDF not found' });
        }
        return res.status(200).json({ message: 'PDF deleted successfully' });
    } catch (error) {
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;

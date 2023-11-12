const express = require('express')
const router = express.Router()
const PDF = require('../models/PDF')
const Violation = require('../models/Violation')

router.delete('/pdfs/:id', async (req,res) =>{
    try{
        let pdf = await PDF.findOne({ _id: req.params.id }).populate({
            path:'userId',
            ref:'User'
        })

        console.log(pdf)

        let vDeleted = await Violation.deleteOne({ 
            accountId:pdf.userId?.accountId ?? 'xxx',
            createdAt: pdf.createdAt,
            username:pdf.userId?.name ?? 'xxx'
         })

         console.log(vDeleted)

        let dPdf = await PDF.deleteOne({
            _id: req.params.id
        });

        console.log(dPdf)
        return res.status(200).send("PDF Was Deleted")
    }catch (error){
        console.log(error.message)
        return res.status(500).send(error.message)
    }
})

router.delete('/pdfs',async (req,res) =>{
    try{
        await PDF.deleteMany({})
        return res.status(200).send("All PDFS Were Deleted")
    }catch (error){
        return res.status(500).send(error.message)
    }
})

module.exports = router
const express = require('express')
const router = express.Router()
const Report = require('../models/IssueReport')

router.delete('/reports/:id', async (req, res) => {
    try{
        await Report.deleteOne({
            _id: req.params.id
        })
        return res.status(200).json('success')
    }catch(err){
        console.log(err.message)
        return res.status(500).json(err.message)
    }
})

module.exports = router
const express = require('express')
const router = express.Router()
const axios = require('axios')

router.get('/drivers',async (req,res) =>{
    try{
        let drivers = await axios.get('http://localhost:3000/api/drivers')
        console.log(drivers.data)
        return res.render('drivers',{
            drivers:drivers
        })
    }catch (error){
        return res.status(500).send(error.message)
    }
})


module.exports = router
const express = require('express')
const router = express.Router()

const Group = require('../models/Group')

router.get('/groups', async (req,res) =>{
    try{
        let groups = await Group.find({})
        return res.status(200).json(groups)
    }catch (error){
        return res.status(500).json([])
    }
})

router.post('/groups', async (req,res) =>{
    try{
        const { name, notice, text } = req.body
        let group = new Group({ name, notice, text })
        await group.save()
        return res.status(200).json(group)
    }catch (error){
        console.log(error.message)
        return res.status(500).send(error.message)
    }
})


router.delete('/groups/:id', async (req,res) =>{
    try{
        console.log(req.params)
        await Group.deleteOne({ _id: req.params.id })
        return res.status(200).send("Deleted")
    }catch (error){
        return res.status(500).send(error.message)
    }
})

router.delete('/groups', async (req,res) =>{
    try{
        await Group.deleteMany({})
        return res.status(200).send("All Groups Were Deleted")
    }catch (error){
        return res.status(500).send(error.message)
    }
})

router.put('/groups/:id', async (req,res) =>{
    try{
        const { name, notice, text } = req.body
        console.log(req.params)
        console.log(req.body)
        let updated = await Group.findOneAndUpdate({ _id: req.params.id },{
            name, notice, text
        },{ $new: true })
        if(updated) console.log('yes updated')
        else console.log('not updated')

        return res.status(200).send("Updated")
    }catch (error){
        return res.status(500).send(error.message)
    }
})

module.exports = router
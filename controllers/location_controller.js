const Location = require('../models/Location')

const createLocation = async (req,res) =>{
    try{
        const { location, days, shifts } = req.body
        console.log(req.body)
        let loc = new Location({ location, days, shifts })
        await loc.save()

        return res.status(200).send("Location Was Created")
    }catch (error){
        return res.status(500).send(error.message)
    }
}

const updateLocation = async (req,res) =>{
    try{
        const { location, days, shifts } = req.body
        const { id } = req.params
        await Location.findOneAndUpdate({ _id: id },{
            location,
            days,
            shifts
        },{ $new: true })

        return res.status(200).send("Location Was Updated")
    }catch (error){
        return res.status(500).send(error.message)
    }
}

const deleteLocation = async (req,res) =>{
    try{
        const { id } = req.params
        await Location.deleteOne({ _id: id })

        return res.status(200).send("Location Was Deleted")
    }catch (error){
        return res.status(500).send(error.message)
    }
}

const deleteAllLocations = async (req,res) =>{
    try{
        await Location.deleteMany({})

        return res.status(200).send("All Locations Were Deleted")
    }catch (error){
        return res.status(500).send(error.message)
    }
}

const getAllLocations = async (req,res) =>{
    try{
        let locations = await Location.find({})
        return res.status(200).json(locations)
    }catch (error){
        return res.status(200).send(error.message)
    }
}


module.exports = {
    createLocation,
    updateLocation,
    deleteLocation,
    getAllLocations,
    deleteAllLocations
}
const Car = require('../models/Car')
const qr = require("qr-image");
const fs = require("fs");


const createNewCar = async (req,res) =>{
    try{
        console.log(req.body)
        const { boardNumber, privateNumber, kilometers } = req.body

        let existingCar = await Car.findOne({ 
            boardNumber,
            privateNumber
         })

         if(existingCar){
            return res.status(400).send("Car Data Already Exists")
         }

        

        const car = new Car({
            boardNumber, privateNumber, kilometers,
        })
        await car.save()

        const data = JSON.stringify({
            boardNumber,
            privateNumber,
            _id: car._id
        }); // URL or any data you want to encode
        const qrCode = qr.image(data, { type: 'png' });


        // Generate a unique filename
        const filename = `${boardNumber}_${privateNumber}.png`;
        const filePath = `public/qrcodes/${filename}`;

        const qrStream = qrCode.pipe(fs.createWriteStream(filePath));

        qrStream.on('finish', () => {
            console.log(`QR Code saved as ${filename}`);
        });


        await Car.updateOne({ _id: car._id },{
            qrcode: process.env.BASE_URL  + `qrcodes/${filename}`
        })


        return res.status(200).send("Car Was Created")
    }catch (error){
        console.log(error.message)
        return res.status(500).send(error.message)
    }
}

const getAllCars = async (req,res) =>{
    try{
        let cars = await Car.find({})

        return res.status(200).json(cars)
    }catch (error){
        return res.status(500).send(error.message)
    }
}


const updateCar = async (req,res) =>{
    try{
        const { id } = req.params
        const { boardNumber, privateNumber,kilometers } = req.body

        const data = JSON.stringify({
            boardNumber,
            privateNumber,
            _id: id
        }); // URL or any data you want to encode
        const qrCode = qr.image(data, { type: 'png' });


        // Generate a unique filename
        const filename = `qrcode_${Date.now()}.png`;
        const filePath = `public/qrcodes/${filename}`;

        const qrStream = qrCode.pipe(fs.createWriteStream(filePath));

        qrStream.on('finish', () => {
            console.log(`QR Code saved as ${filename}`);
        });

        await Car.findOneAndUpdate({ _id: id },{
            boardNumber, privateNumber,kilometers,
            _id:id,
            qrcode: process.env.BASE_URL  + `qrcodes/${filename}`
        },{ $new: true })

        return res.status(200).send("Car Was Updated")
    }catch (error){
        return res.status(500).send(error.message)
    }
}

const deleteCar = async (req,res) =>{
    try{
        const { id } = req.params
        await Car.deleteOne({ _id: id })

        return res.status(200).send("Car Was Deleted")
    }catch (error){
        return res.status(500).json(error.message)
    }
}

const deleteAllCars = async (req,res) =>{
    try{
        await Car.deleteMany({})

        return res.status(200).send("All Cars Were Deleted")
    }catch (error){
        return res.status(500).json(error.message)
    }
}

const resetCarKilometers = async (req,res) =>{
    try{
        const { id } = req.params
        await Car.updateOne({ _id:id },{
            currentKilometers:0,
            kilometers:0
        })

        return res.sendStatus(200)
    }catch(error){
        return res.status(500).send(error.message)
    }
}

module.exports = {
    createNewCar,
    getAllCars,
    updateCar,
    deleteCar,
    deleteAllCars,
    resetCarKilometers
}
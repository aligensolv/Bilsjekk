const express = require('express')
const {getAllCars, createNewCar, updateCar, deleteCar, deleteAllCars, resetCarKilometers} = require("../controllers/car_controller");
const router = express.Router()

router.get('/cars', getAllCars)
router.get('/cars/:id/reset',resetCarKilometers)
router.post('/cars', createNewCar)
router.put('/cars/:id', updateCar)
router.delete('/cars/:id', deleteCar)
router.delete('/cars', deleteAllCars)

module.exports = router
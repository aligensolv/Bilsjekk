const mongoose = require('mongoose')
// const uri = 'mongodb://admin:admin123@127.0.0.1:27017/admin'; // Replace with your MongoDB connection URI
const uri = 'mongodb+srv://danaaka8:p6TPp7ILrQUlDKfE@cluster0.uyhqfof.mongodb.net/nordic'; // Replace with your MongoDB connection URI


mongoose.connect(uri).then(() => console.log('connected mongoose'))

const mongoose = require('mongoose');

const AppNotificationSchema = new mongoose.Schema({
    delivery_date:{
        type: String,
        required: true,
    },

    content:{
        type: String,
        required: true,
    },


    title:{
        type: String,
        required: true,
    },
})

const AppNotificationModel = mongoose.model('AppNotification', AppNotificationSchema)

module.exports = AppNotificationModel
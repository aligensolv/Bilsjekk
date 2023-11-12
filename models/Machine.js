const mongoose = require('mongoose')
const cron = require('node-cron')
const admin = require('../utils/firebase');


const machineSchema = mongoose.Schema({
    serial:{
        type: Number,
        required: true
    },
    totalWorkingTime:{
      type: Number,
      default: 0
    },

    totalOfflineTime:{
      type: Number,
      default: 0
    },

    lastActiveTime:{
      type: String,
      default: null
    },
    
    status:{
      type: String,
      enum: ['active','waiting','inactive'],
      default: 'active'
    },
    qrcode:{
      type: String,
      default: null
    },
    zone:{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Zone',
      required: true
    },
    zoneLocation:{
      type: String,
      required: true
    },

    longitude:{
      type: Number,
      required: true
    },

    latitude:{
      type: Number,
      required: true
    },

    categories:{
      type: [mongoose.Schema.Types.ObjectId],
      ref: 'IssueCategory',
      required: true
    }
  }
);

const machineModel = mongoose.model('machine', machineSchema)

// Define a function to send notifications
async function sendNotifications() {
  try {
    let mahcinesWithIssues = await machineModel.find({
      status: 'inactive'
    })

    if(mahcinesWithIssues.length > 0){
      const message = {
        data: {
            title: 'non-fixed machines',
            body: 'There are some non-fixed machines available',
            type: 'issue_not_closed_notify',
        },
        topic: 'nordic', // Replace with the topic you want to use
      };
      
      let response = await admin
        .messaging()
        .send(message)
    }
  } catch (error) {
    console.error('Error sending notifications:', error);
  }
}

// Schedule the task to run every hour
cron.schedule('0 */10 * * * *', () => {
  console.log(new Date());
  sendNotifications();
});

module.exports = machineModel;
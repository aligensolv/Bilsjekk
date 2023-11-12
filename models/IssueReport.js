const mongoose = require('mongoose');

const IssueReportSchema = new mongoose.Schema({
    pdf:{
        type: String,
        required: true
    },

    notes:{
        type: String,
        default: ''
    },

    details:{
        type: String,
        default: ''
    },

    image:{
        type: String,
        required: true
    },

    date:{
        type: String,
        required: true
    },

    serial:{
        type: String,
        required: true
    },

    zone:{
        type: String,
        required: true
    },

    zoneLocation:{
        type: String,
        required: true
    }
})

module.exports = mongoose.model('IssueReport', IssueReportSchema);
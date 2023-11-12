const mongoose = require('mongoose');

const IssueCategorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },

    problems:{
        type: [String],
        default: []
    },

    importanceLevel:{
        type: Number,
        required: true
    }
})

const IssueCategoryModel = mongoose.model('IssueCategory', IssueCategorySchema)

module.exports = IssueCategoryModel
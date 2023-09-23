const mongoose = require('mongoose');

const submssionSchema =new mongoose.Schema({
    project:{
        type: mongoose.Schema.ObjectId,
        ref: 'Project',
        required: true
    },
    filename: {
        type: String
    },
    s3url: {
        type: String
    }
});

module.exports = new mongoose.model('Submission', submssionSchema);
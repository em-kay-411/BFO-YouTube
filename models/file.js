const mongoose = require('mongoose');

const fileSchema =new mongoose.Schema({
    project:{
        type: mongoose.Schema.ObjectId,
        ref: 'Project',
        required: true
    },
    filename: {
        type: String
    },
    s3Url: {
        type: String
    }
});

module.exports = new mongoose.model('File', fileSchema);
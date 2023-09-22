const mongoose = require('mongoose');

const fileSchema =new mongoose.Schema({
    projectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project'
    },
    filename: {
        type: String
    },
    s3Key: {
        type: String
    }
});

module.exports = new mongoose.model('File', fileSchema);
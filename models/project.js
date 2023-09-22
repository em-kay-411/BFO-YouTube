const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    manager: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    files: {
        type:
            [{
                type: mongoose.Schema.Types.ObjectId,
                ref: 'File'
            }],
        required: true
    },
    editors: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    deadline: {
        type: Date,
    }
});

module.exports = new mongoose.model('Project', projectSchema);
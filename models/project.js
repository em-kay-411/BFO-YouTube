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
    status: {
        type: String,
        enum: ['ongoing', 'done'],
        default: 'ongoing'
    },
    files: {
        type:
            [{
                type: mongoose.Schema.Types.ObjectId,
                ref: 'File'
            }],
    },
    submissions: {
        type:
            [{
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Submission'
            }],
    },
    editors: {
        type:
            [{
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            }],
    },
    deadline: {
        type: Date,
    }
});

module.exports = new mongoose.model('Project', projectSchema);
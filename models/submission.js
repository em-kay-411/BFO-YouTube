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
    },
    thumbnail_url:{
        type : String
    },
    subtitles_url : {
        type : String
    },
    video_title : {
        type :String
    },
    video_description : {
        type : String
    },
    privacy : {
        type: String
    },
    defaultLanguage : {
        type : String
    },
    isForKids : {
        type : String
    },
    cards: {
        type : [{
            type : mongoose.Schema.ObjectId,
            ref : 'Card'
        }]
    }
});

module.exports = new mongoose.model('Submission', submssionSchema);
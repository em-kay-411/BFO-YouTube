const mongoose = require('mongoose');

const cardSchema = new mongoose.Schema({
    teaserText : {
        type : String
    },
    teaserStartTime : {
        type: Number
    },
    cardType : {
        type : String
    },
    videoURL : {
        type :String
    }
});

module.exports = new mongoose.model('Card', cardSchema);
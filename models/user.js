const mongoose = require('mongoose');
const validator = require('validator');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Enter your name']
  },
  email: {
    type: String,
    required: [true, 'Please provide your email'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email']
  },
  role: {
    type: String,
    enum: ['manager', 'editor'],
    default: 'manager'
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 8
  },
});


module.exports = mongoose.model('User', userSchema);
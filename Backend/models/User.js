// models/User.js
const mongoose = require('mongoose');
const validator = require('validator');

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: true
  },
  rank: {
    type: String,
    enum: ['white', 'blue', 'purple', 'brown', 'black'],
    default: 'white'
  },
  stripes: {
    type: Number,
    min: 0,
    max: 4,
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('User', UserSchema);

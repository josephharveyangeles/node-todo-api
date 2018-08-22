const mongoose = require('mongoose');

// mongoose will create a collection named, 'Users' by default.
const User = mongoose.model('User', {
  email: {
    type: String,
    required: true,
    minlength: 1,
    trim: true
  }
})

module.exports = {User};
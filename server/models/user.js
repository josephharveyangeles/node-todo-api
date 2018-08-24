const _ = require('lodash')
const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');

let UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    trim: true,
    minlength: 1,
    unique: true,
    validate: {
      validator: validator.isEmail,
      message: '{VALUE} is not a valid email.'
    }
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  tokens: [{
    access: {type: String, required: true},
    token: {type: String, required: true}
  }]
});

UserSchema.methods.toJSON = function () {
  const userObject = this.toObject();
  return _.pick(userObject, ['_id', 'email']);
}


// using arrow function here will bind 'this' to 'UserSchema.methods'
UserSchema.methods.generateAuthToken = function () {
  // let user = this;
  const access = 'auth';
  const token = jwt.sign({_id: this._id.toHexString(), access}, 'abc123').toString();
  this.tokens = this.tokens.concat([{access, token}]);
  
  return this.save().then(() => token); // implicit return, returning a value on a promise will pass that value as the result of the next then call, as oppose to returning a promise which will be the next thenable.
};

// mongoose will create a collection named, 'users' by default.
const User = mongoose.model('User', UserSchema);

module.exports = {User};
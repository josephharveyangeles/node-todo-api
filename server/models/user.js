const _ = require('lodash')
const bcrypt = require('bcryptjs');

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
  let user = this;
  const access = 'auth';
  const token = jwt.sign({_id: user._id.toHexString(), access}, process.env.JWT_SECRET).toString();
  user.tokens.push({access, token});
  return user.save().then(() => token); // implicit return, returning a value on a promise will pass that value as the result of the next then call, as oppose to returning a promise which will be the next thenable.
};

UserSchema.methods.removeToken = function (token) {
  var user = this;
  return user.update({
    $pull: { // will remove the elment that has the follwing 'token'
      tokens: { token }
    }
  })
};

UserSchema.statics.findByToken = function (token) {
  const User = this;

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch(e) {
    return Promise.reject();
  }

  return User.findOne({
    '_id': decoded._id,
    'tokens.token': token,
    'tokens.access': 'auth'
  });

};

UserSchema.statics.findByCredentials = async function({email, password}) {
  const User = this;
  // let userFound;
  const user = await User.findOne({email});

  if (!user) {
    return Promise.reject('User does not exist');
  }

  const isMatched = await bcrypt.compare(password, user.password);
  if (isMatched) {
    return user;
  }
  return Promise.reject('Invalid password.');
}
// mongoose middleware
UserSchema.pre('save', function(next) {
  const user = this;
  if (!user.isModified('password')) {
    next();
  }
  bcrypt.genSalt(10)
        .then(salt => bcrypt.hash(user.password, salt))
        .then(hash => user.password = hash)
        .then(() => next())
        .catch(e => next(e))
})

// mongoose will create a collection named, 'users' by default.
const User = mongoose.model('User', UserSchema);

module.exports = {User};
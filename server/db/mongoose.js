const mongoose = require('mongoose');
// https://mongoosejs.com/docs/guide.html

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/TodoApp', {useNewUrlParser: true});

module.exports = {mongoose}
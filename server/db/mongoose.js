const mongoose = require('mongoose');
// https://mongoosejs.com/docs/guide.html

mongoose.Promise = global.Promise;
const DB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/TodoApp';
mongoose.connect(DB_URI, {useNewUrlParser: true});

module.exports = {mongoose}
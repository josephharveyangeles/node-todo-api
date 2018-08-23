const mongoose = require('mongoose');
// https://mongoosejs.com/docs/guide.html

mongoose.Promise = global.Promise;
mongoose.set('useFindAndModify', false)
mongoose.connect(process.env.MONGODB_URI, {useNewUrlParser: true});

module.exports = {mongoose}
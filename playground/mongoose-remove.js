const {ObjectID} = require('mongodb');
const {mongoose} = require('../server/db/mongoose');
const {Todo} = require('../server/models/todo');

// Todo.remove({}).then(result => console.log(result));

//Todo.findOneAndRemove({ props: values})
//Todo.findByIdAndRemove

Todo.findByIdAndRemove('5b7e55c6e5d3f72eac96481f').then(res => console.log(res));
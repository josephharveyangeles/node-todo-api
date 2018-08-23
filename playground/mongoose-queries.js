const {ObjectID} = require('mongodb');
const {mongoose} = require('./../server/db/mongoose');
const {Todo} = require('./../server/models/todo');

let id = '5b7e1e710d5e5235c868aec5';
// let id = '6b7e1e710d5e5235c868aec5';
// let id = '6b7e1e710d5e5235c868aec5eefef';

if (!ObjectID.isValid(id)) {
  mongoose.disconnect();
  return console.error('Id not valid');
}

Todo.find({
  _id: id
}).then(todos => {
  console.log('Todos', JSON.stringify(todos, undefined, 2));
})

Todo.findOne({
  _id: id
}).then(todos => {
  console.log('Todos', JSON.stringify(todos, undefined, 2));
})

Todo.findById(id)
    .then(todos => console.log('Todos', JSON.stringify(todos, undefined, 2)));
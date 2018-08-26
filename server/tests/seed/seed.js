const {ObjectID} = require('mongodb');
const jwt = require('jsonwebtoken');

const {Todo} = require('./../../models/todo');
const {User} = require('./../../models/user');

const userOneId = new ObjectID();
const userTwoId = new ObjectID();
const users = [
  { 
    _id: userOneId,
    email: 'test@test.com',
    password: 'passwordOne',
    tokens: [
      { 
        access: 'auth',
        token: jwt.sign({_id: userOneId, access: 'auth'}, process.env.JWT_SECRET).toString() 
      }
    ]
  },
  {
    _id: userTwoId,
    email: 'test2@test.com',
    password: 'passwordTwo',
    tokens: [
      { 
        access: 'auth',
        token: jwt.sign({_id: userTwoId, access: 'auth'}, process.env.JWT_SECRET).toString()
      }
    ]
  }
]

const todos = [
  { _id: new ObjectID(), text: 'Fist test todo', _creator: userOneId },
  { _id: new ObjectID(), text: 'Second test todo', completed: true, completedAt: 333, _creator: userTwoId }
];

const populateTodos = done => {
  Todo.deleteMany({})
    .then(() => Todo.insertMany(todos))
    .then(() => done())
    .catch(e => done(e));
};

const populateUsers = done => {
  User.remove({})
      .then(() => {
        const userOne = new User(users[0]).save();
        const userTwo = new User(users[1]).save();

        return Promise.all([userOne, userTwo])
      })
      .then(() => done())
      .catch(e => done(e));
}

module.exports = {
  todos,
  users,
  populateTodos,
  populateUsers
}
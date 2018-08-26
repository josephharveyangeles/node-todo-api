require('./config/config');

const _ = require('lodash')
const express = require('express');
const bodyParser = require('body-parser');
const {ObjectID} = require('mongodb');

const {mongoose} = require('./db/mongoose'); // even though, this wasn't used, commenting this out will break stuff because the db initialization wasn't run. Should refactor this
const {Todo} = require('./models/todo');
const {User} = require('./models/user');
const {authenticate} = require('./middleware/authenticate');

const PORT = process.env.PORT || 3000;

const app = express();

const isValidId = (id) => {
  return ObjectID.isValid(id);
}

app.use(bodyParser.json());

// Add a  todos
app.post('/todos', authenticate, (req, res) => {
  const todo = new Todo({
    text: req.body.text,
    _creator: req.user._id
  });

  todo.save()
      .then(todo => res.send({todo}))
      .catch(e => res.status(400).send(e));
})

// Get todos
app.get('/todos', authenticate, (req, res) => {
  Todo.find({_creator: req.user._id})
    .then(todos => res.send({todos}))
    .catch(e => res.status(400).send(e));
});


// Get a single todo via id
app.get('/todos/:id', authenticate, (req, res) => {
  const id = req.params.id;
  if (!isValidId(id)) {
    return res.status(400).send({error: 'Invalid id'});
  }

  Todo.findOne({
    _id: id,
    _creator: req.user._id
  }).then(todo => {
    if (!todo) {
      return res.status(400).send({});
    }
    res.send({todo}); // future-proofing, use object so you could add more properties in the future. Imagine the front-end was already built then you add a new property? Everything that uses this route will have to be changed.
  }).catch(e => res.status(400).send({}));

});

app.delete('/todos/:id', authenticate, (req, res) => {
  const id = req.params.id;
  if (!isValidId(id)) {
    return res.status(400).send();
  }
  Todo.findOneAndRemove({
    _id: id,
    _creator: req.user._id
  }).then(todo => {
    if (!todo) {
      return res.status(400).send();
    }
    res.send({todo});
  }).catch(e => res.status(400).send());
});


// Update a specific todo
app.patch('/todos/:id', authenticate, (req, res) => {
  const id = req.params.id;
  if (!isValidId(id)) {
    return res.status(400).send();
  }
  const body = _.pick(req.body, ['text', 'completed']); 
  if(_.isBoolean(body.completed) && body.completed) {
    body.completedAt = new Date().getTime();
  } else {
    body.completed = false;
    body.completedAt = null;
  }
  
  Todo.findOneAndUpdate({
      _id: id,
      _creator: req.user._id
    }, {$set: body}, {new: true})
      .then(todo => {
        if (!todo) {
          return Promise.reject();
        }
        res.send({todo});
      })
      .catch(e => res.status(400).send());

});

// Sign Up
app.post('/users', (req, res) => {
  const body = _.pick(req.body, ['email', 'password']);
  const user = new User(body);

  user.save()
      .then(user => user.generateAuthToken())
      .then(token => res.header('x-auth', token).send(user))
      .catch(e => res.status(400).send(e));
})

// User profile
app.get('/users/me', authenticate, (req, res) => {
  res.send(req.user);
});

// LOGIN
app.post('/users/login', async (req, res) => {
  const body = _.pick(req.body, ['email', 'password']);
  try {
    const user = await User.findByCredentials(body);
    const token = await user.generateAuthToken();
    res.header('x-auth', token).send(user);
  } catch (err) {
    res.status(400).send(err);
  }
});

// LOGOUT
app.delete('/users/me/token', authenticate, (req, res) => {
  req.user.removeToken(req.token)
    .then(() => res.status(200).send())
    .catch(() => res.status(400).send());
});

app.listen(PORT, () => {
  console.log(`Started on port ${PORT}`);
});

module.exports = {app}
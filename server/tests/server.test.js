const expect = require('expect');
const request = require('supertest');
const {ObjectID} = require('mongodb');

const {app} = require('./../server');
const {Todo} = require('./../models/todo');
const {User} = require('./../models/user');
const {todos, populateTodos, users, populateUsers} = require('./seed/seed');

beforeEach(populateUsers);
beforeEach(populateTodos);

describe('POST /todos', () => {

  it('should create a new todo', done => {
    const text = 'Test todo text';

    request(app)
      .post('/todos')
      .send({text})
      .expect(200)
      .expect(res => {
        expect(res.body.todo.text).toBe(text);
      })
      .end((err, res) => { // End block for testing internal state after the endpoint was called, as opposed to expect(res) where you test the actual response. The effect are both the same but it seems like it's more semantically correct to use end() for non-response related assertions.
        if (err) {
          return done(err);
        }
        Todo.countDocuments().then(count => {
          expect(count).toBe(3);
          return Todo.find({text});
        }).then(res => {
          expect(res[0].text).toBe(text);
          done();
        }).catch(e => done(e));
      });

    });

    it('should not create todo with invalid body data', done => {
      request(app)
        .post('/todos')
        .send()
        .expect(400)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          Todo.countDocuments().then(count => {
            expect(count).toBe(2)
            done();
          }).catch(e => done(e));
        });
    });

    
  });
  
  describe('GET /todos', () => {
    
    it('should get all todos', done => {
      request(app)
      .get('/todos')
      .expect(200)
      .expect(res => {
        expect(res.body.todos.length).toBe(2);
      }).end(done)
    });
    
  })
  
  describe('GET /todos/:id', () => {
    
    it('should return a todo doc', (done) => {
      request(app)
      .get(`/todos/${todos[0]._id.toHexString()}`)
      .expect(200)
      .expect(res => {
        expect(res.body.todo.text).toBe(todos[0].text);
      })
      .end(done);
    });
    
    it('shoud return 400 if todo is non-existing', (done) => {
      request(app)
        .get(`/todos/${new ObjectID().toHexString()}`)
        .expect(400)
        .end(done);
    });

    it('shoud return 400 for invalid ids', (done) => {
      request(app)
        .get(`/todos/1234`)
        .expect(400)
        .end(done);
    });
})

describe('DELETE /todos/:id', () => {
  it('should remove a todo', done => {
    const hexId = todos[1]._id.toHexString();
    request(app)
      .delete(`/todos/${hexId}`)
      .expect(200)
      .expect(res => {
        expect(res.body.todo._id).toBe(hexId);
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        Todo.findById(hexId).then(res => {
          expect(res).toBeNull();
          done();
        }).catch(e => done(e));
      })
  })

  it('should return 400 if todo not found', done => {
    const hexId = new ObjectID().toHexString();
    request(app)
      .delete(`/todos/${hexId}`)
      .expect(400)
      .end(done);
    });
    
  it('should return 400 if object id is invalid', done => {
    request(app)
      .delete(`/todos/1234fs`)
      .expect(400)
      .end(done);
  });

});

describe('PATCH /todos/:id', () => {
  it('should update the todo', done => {
    const hexId = todos[0]._id.toHexString();
    request(app)
      .patch(`/todos/${hexId}`)
      .send({completed: true})
      .expect(200)
      .expect(res => {
        expect(res.body.todo.completed).toBeTruthy();
        expect(typeof res.body.todo.completedAt).toBe('number'); // expect has been changed from v21+
      })
      .end(done)
  });

  it('should clear completedAt when todo is not completed', done => {
    const hexId = todos[1]._id.toHexString();
    const text = 'updated'
    request(app)
      .patch(`/todos/${hexId}`)
      .send({text, completed: false})
      .expect(200)
      .expect(res => {
        const {todo} = res.body;
        expect(todo.completed).toBeFalsy();
        expect(todo.text).toBe(text);
        expect(todo.completedAt).toBeNull();
      })
      .end(done);
  });
})

describe('/GET /users/me', () => {
  it('should return user if authenticated', done => {
    request(app)
      .get('/users/me')
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .expect(res => {
        expect(res.body._id).toBe(users[0]._id.toHexString());
        expect(res.body.email).toBe(users[0].email);
      })
      .end(done);
  })

  it('should return a 401 if not authenticated', done => {
    request(app)
      .get('/users/me')
      .expect(401)
      .expect(res => expect(res.body).toEqual({}) )
      .end(done);
  })
})

describe('POST /users', () => {

  it('should create a user', done => {
    const email = 'example@example.com';
    const password = '123mnb';
    request(app)
      .post('/users')
      .send({email, password})
      .expect(200)
      .expect(res => {
        expect(res.headers['x-auth']).toBeDefined();
        expect(res.body._id).toBeDefined();
        expect(res.body.email).toBe(email);
      })
      .end(err => {
        if (err) {
          return done(err);
        }
        User.findOne({email})
            .then(user => {
              expect(user).toBeDefined();
              expect(user.password).not.toEqual(password);
              done();
            })
      });
  })

  it('should return validation errors if invalid data', done => {
    const email = 'invalid email';
    const password = 'password';
    request(app)
      .post('/users')
      .send({email, password})
      .expect(400)
      .expect(res => {
        expect(res.body._id).not.toBeDefined();
        expect(res.body.email).not.toBeDefined();
      })
      .end(err => {
        if (err) return done(e);
        User.findOne({email})
          .then(user => {
            expect(user).toBeNull();
            done();
          })
      });
  });

  it('should not create user if email in use', done => {
    const {email, password} = users[0];
    request(app)
      .post('/users')
      .send({email, password})
      .expect(400)
      .end(done);
  });

});
const expect = require('expect');
const request = require('supertest');
const {ObjectID} = require('mongodb');
const {app} = require('./../server');
const {Todo} = require('./../models/todo');

const todos = [
  { _id: new ObjectID(), text: 'Fist test todo' },
  { _id: new ObjectID(), text: 'Second test todo' }
]

beforeEach(done => {
  Todo.deleteMany({})
    .then(() => Todo.insertMany(todos))
    .then(() => done());
});

describe('POST /todos', () => {

  it('should create a new todo', done => {
    const text = 'Test todo text';

    request(app)
      .post('/todos')
      .send({text})
      .expect(200)
      .expect(res => {
        expect(res.body.text).toBe(text);
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
            expect(count).toBe(2);
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
const { MongoClient, ObjectID } = require('mongodb');

let obj = new ObjectID();
console.log(obj);

MongoClient.connect('mongodb://localhost:27017/TodoApp', {useNewUrlParser: true})
            .then((client) => {
              console.log('Connected to mongodb server');
              const db = client.db('TodoApp');
              // db.collection('Users').insertOne({
              //   name: 'Nestly Anne Cruz',
              //   age: 24,
              //   location: 'Philippines'
              // }).then(result => {
              //   console.log(JSON.stringify(result.ops, undefined, 2));
              //   console.log(JSON.stringify(result.ops[0]._id.getTimestamp(), undefined, 2));
              // })
              client.close();
            })
            .catch((reason) => console.error(reason));
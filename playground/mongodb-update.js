const { MongoClient, ObjectID } = require('mongodb');

MongoClient.connect('mongodb://localhost:27017/TodoApp', {useNewUrlParser: true})
            .then((client) => {
              console.log('Connected to mongodb server');
              const db = client.db('TodoApp');
              
              // db.collection('Todos').findOneAndUpdate({
              //   _id: new ObjectID("5b7d2095e8967a5ddc7562d4")
              // }, {
              //   $set: { completed: true }
              // }, { returnOriginal: false })
              // .then((result) => {
              //   console.log(JSON.stringify(result, undefined, 2))
              // })
              db.collection('Users').findOneAndUpdate({
                _id: new ObjectID("5b7d02710e26f32d68e62349")
              }, {
                $set: { name: 'Joseph Harvey Angeles' },
                $inc: { age: 1 }
              }, { returnOriginal: false }).then((result) => {
                console.log(JSON.stringify(result, undefined, 2))
                client.close();
              })

            })
            .catch((reason) => console.error(reason));
// https://docs.mongodb.com/manual/reference/operator/update/
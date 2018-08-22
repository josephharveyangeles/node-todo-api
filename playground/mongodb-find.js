const { MongoClient, ObjectID } = require('mongodb');

MongoClient.connect('mongodb://localhost:27017/TodoApp', {useNewUrlParser: true})
            .then((client) => {
              console.log('Connected to mongodb server');
              const db = client.db('TodoApp');
              // db.collection('Todos').find({
              //   _id: new ObjectID('5b7d012260d43a2e5c9ee40b')
              // }).toArray().then((docs) => {
              //   console.log(JSON.stringify(docs, undefined, 2));
              //   client.close();
              // })
              // db.collection('Todos').find().count().then((count) => {
              //   console.log(`Todos count: ${count}`)
              //   client.close();
              // })
              db.collection('Users').find().count().then((count) => {
                console.log(`Users count: ${count}`)
              })
              db.collection('Users').find({name: 'Nikola Tesla'}).toArray().then((docs) => {
                console.log(JSON.stringify(docs, undefined, 2));
                client.close();
              })
            })
            .catch((reason) => console.error(reason));
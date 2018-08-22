const { MongoClient, ObjectID } = require('mongodb');

MongoClient.connect('mongodb://localhost:27017/TodoApp', {useNewUrlParser: true})
            .then((client) => {
              console.log('Connected to mongodb server');
              const db = client.db('TodoApp');
              // deleteMany
              // db.collection('Todos').deleteMany({text: "Eat lunch"})
              //   .then((result) => {
              //     console.log(JSON.stringify(result, undefined, 2));
              //     client.close();
              //   })

              // deleteOne
              // db.collection('Todos').deleteOne({text: "Eat lunch"})
              //   .then((result) => {
              //     console.log(JSON.stringify(result, undefined, 2));
              //     client.close();
              //   })

              // findOneAndDelete
              db.collection('Todos').findOneAndDelete({completed: false})
                .then((result) => {
                  console.log(JSON.stringify(result, undefined, 2));
                  client.close();
                })
            })
            .catch((reason) => console.error(reason));
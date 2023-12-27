const MongoClient = require('mongodb').MongoClient
MongoClient.connect('mongodb://127.0.0.1:27017')
    .then((client) => {
        db = client.db('proj2023MongoDB')
        coll = db.collection('managers')
    })
    .catch((error) => {
        console.log(error.message)
    })

    const getManagers = () => {
        return new Promise((resolve, reject) => {
            // Using the 'find' method to retrieve all documents from the 'coll' collection
            coll.find().toArray()
                .then(result => {
                    // Resolve the promise with the result
                    resolve(result);
                })
                .catch(error => {
                    // Reject the promise with the error
                    reject(error);
                });
        });
    };
module.exports = { getManagers };
const MongoClient = require('mongodb').MongoClient;
let db, coll;

MongoClient.connect('mongodb://127.0.0.1:27017')
    .then((client) => {
        db = client.db('proj2023MongoDB');
        coll = db.collection('managers');
    })
    .catch((error) => {
        console.log(error.message);
    });

const getManagers = () => {
    return new Promise((resolve, reject) => {
        coll.find().toArray()
            .then(result => {
                resolve(result);
            })
            .catch(error => {
                reject(error);
            });
    });
};

const getManagerById = (mgrid) => {
    return new Promise((resolve, reject) => {
        coll.findOne({ _id: mgrid })
            .then(manager => {
                resolve(manager);
            })
            .catch(error => {
                reject(error);
            });
    });
};

module.exports = { getManagers, getManagerById };

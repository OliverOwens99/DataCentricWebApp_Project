const MongoClient = require('mongodb').MongoClient;
let db, coll;
// Connect to the MongoDB database
MongoClient.connect('mongodb://127.0.0.1:27017')
    .then((client) => {
        db = client.db('proj2023MongoDB');
        coll = db.collection('managers');
    })
    .catch((error) => {
        console.log(error.message);
    });
// Get all managers
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
// Get a manager by id
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
// Add a new manager
const addManager = (manager) => {
    return new Promise((resolve, reject) => {
        coll.insertOne(manager)
            .then(result => {
                resolve(result);
            })
            .catch(error => {
                reject(error);
            });
    });
}
// Export the functions
module.exports = { getManagers, getManagerById, addManager};

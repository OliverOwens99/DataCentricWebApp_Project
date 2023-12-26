const MongoClient = require('mongodb').MongoClient
MongoClient.connect('mongodb://127.0.0.1:27017')
    .then((client) => {
        db = client.db('proj2023MongoDB')
        coll = db.collection('managers')
    })
    .catch((error) => {
        console.log(error.message)
    })

function getManagers() {
    return new Promise((resolve, reject) => {
        coll.find().toArray()
            .then(result => {
                resolve(result)
            })
            .catch(e => {
                reject(e)
            })
    })
}
module.exports = { getManagers };
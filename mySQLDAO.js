const e = require('express');
var pmysql = require('promise-mysql');
var pool;


pmysql.createPool({
    connectionLimit: 3,
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'proj2023'
})
    .then(p => {
        pool = p
    })
    .catch(e => {
        console.log("pool error:" + e)
    })



function getstores() {
    return new Promise((resolve, reject) => {
        pool.query('SELECT * FROM store')
            .then(result => {
                resolve(result)
            })
            .catch(e => {
                reject(e)
            })
    })





}
module.exports = { getstores };
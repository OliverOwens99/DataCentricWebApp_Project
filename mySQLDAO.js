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
    });
}

function getProducts() {
    return new Promise((resolve, reject) => {
        const query = `
            SELECT p.*, s.sid, s.location, ps.price
            FROM product p
            JOIN product_store ps ON p.pid = ps.pid
            JOIN store s ON ps.sid = s.sid`;
        
        pool.query(query, (error, results) => {
            if (error) {
                reject(error);
            } else {
                resolve(results);
            }
        });
    });
}
module.exports = { getstores, getProducts };
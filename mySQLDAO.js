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

function getStoreById(sid) {
    return new Promise((resolve, reject) => {
        pool.query('SELECT * FROM store WHERE sid = ?', [sid])
            .then(result => {
                resolve(result[0]); // Assuming that sid is unique and should return only one store
            })
            .catch(e => {
                reject(e);
            });
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

function updateStore(storeId, location, managerId){
    return new Promise((resolve, reject) => {
        const query = `
            UPDATE store
            SET location = ?, mgrid = ?
            WHERE sid = ?`;
        
        pool.query(query, [location, managerId, storeId], (error, results) => {
            if (error) {
                reject(error);
            } else {
                resolve(results);
            }
        });
    });
}
async function getStoreByManagerId(managerId, currentStoreId) {
    // Assuming you have a MySQL query to fetch a store by managerId and exclude the current store
    const query = 'SELECT * FROM store WHERE mgrid = ? AND sid != ?';
    const result = await pool.query(query, [managerId, currentStoreId]);
    return result[0];
}

module.exports = { getstores, getProducts , updateStore , getStoreById , getStoreByManagerId};
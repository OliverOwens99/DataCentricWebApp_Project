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

const isProductSold = (pid) => {
    return new Promise((resolve, reject) => {
        // Perform a SQL query to check if the product is associated with any store
        const query = 'SELECT COUNT(*) as count FROM product_store WHERE pid = ?';
        pool.query(query, [pid])
            .then(result => {
                // Resolve with true if the product is associated with at least one store
                resolve(result[0].count > 0);
            })
            .catch(error => {
                // Reject with the error if there's an issue with the query
                reject(error);
            });
    });
};

const deleteProduct = (pid) => {
    return new Promise((resolve, reject) => {
        // Perform a SQL query to delete the product
        const query = 'DELETE FROM product WHERE pid = ?';
        pool.query(query, [pid])
            .then(result => {
                // Resolve with true if the product is associated with at least one store
                resolve(result[0].count > 0);
            })
            .catch(error => {
                // Reject with the error if there's an issue with the query
                reject(error);
            });
    });
};


    


module.exports = { getstores, getProducts , updateStore , getStoreById , getStoreByManagerId , isProductSold , deleteProduct};
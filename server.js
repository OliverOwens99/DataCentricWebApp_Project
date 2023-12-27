const express = require('express');
var app = express()
var port = 3000
var mySQLDAO = require('./mySQLDAO.js')
var MongoDAO = require('./MongoDAO.js') // this is the file name
const {check, validationResult} = require('express-validator');


let ejs = require('ejs');
app.set('view engine', 'ejs');

app.get('/', function (req, res) {
    //display a file called home.ejs
    
    res.render('home');
})


app.get('/stores', async (req, res) => {
    try {
        const stores = await mySQLDAO.getstores();
        const managers = await MongoDAO.getManagers();

        // Create a map of manager IDs to manager objects for easy lookup
        const managerMap = {};
        managers.forEach(manager => {
            managerMap[manager.id] = manager;
        });

        // Add a 'manager' property to each store using the managerMap
        stores.forEach(store => {
            store.manager = managerMap[store.managerId];
        });

        res.render('stores', { stores });
    } catch (e) {
        console.error(e);
        res.status(500).send('An error occurred while retrieving store data.');
    }
});

app.get('/stores/edit-store/:sid', async (req, res) => {
    try {
        const store = await mySQLDAO.getstores(req.params.sid);
        const managers = await MongoDAO.getManagers();

        if (!store) {
            console.error('Store not found.');
            return res.status(404).send('Store not found.');
        }

        res.render('edit-store', { store, managers });
    } catch (e) {
        console.error('Error fetching store data:', e);
        res.status(500).send('An error occurred while retrieving store data.');
    }
});



app.post('/stores/edit/:sid', (req, res) => {

})







app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})
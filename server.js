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


app.post('/stores/edit-stores/:sid', [
    // Add validation rules here using express-validator
    check('location').isLength({ min: 1 }).withMessage('Location should be a minimum of 1 character'),
    check('managerId').isLength({ min: 4 }).withMessage('Manager ID should be 4 characters'),
], async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        // If there are validation errors, render the edit-store page with errors
        try {
            const store = await mySQLDAO.getstore(req.params.sid);
            const managers = await MongoDAO.getManagers();
            // Pass the errors array to the template
            res.render('edit-store', { store, managers, errors: errors.array() });
        } catch (e) {
            console.error(e);
            res.status(500).send('An error occurred while retrieving store data.');
        }
    } else {
        // Validation passed, proceed with the update logic
        const { location, managerId } = req.body;
        const storeId = req.params.sid;

        try {
            // Implement your update logic using location, managerId, and storeId
            // For example, mySQLDAO.updateStore(storeId, location, managerId);

            // Redirect to the stores page after a successful update
            res.redirect('/stores');
        } catch (e) {
            console.error(e);
            res.status(500).send('An error occurred while updating store data.');
        }
    }
});

app.get('/products', async (req, res) => {
    try {
        const products = await mySQLDAO.getProducts();
        console.log(products);
        res.render('products', { products });
    } catch (e) {
        console.error(e);
        res.status(500).send('An error occurred while retrieving product data.');
    }
});






app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})
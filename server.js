const express = require('express');
var app = express()
var port = 3000
var mySQLDAO = require('./mySQLDAO.js')
var MongoDAO = require('./MongoDAO.js') // this is the file name
const {check, validationResult} = require('express-validator');
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


let ejs = require('ejs');
app.set('view engine', 'ejs');

app.get('/', function (req, res) {
    //display a file called home.ejs
    
    res.render('home');
})

// to display the stores page and the data from the database
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

// to display the edit-store page
app.get('/stores/edit-store/:sid', async (req, res) => {
    try {
        const store = await mySQLDAO.getStoreById(req.params.sid);
        const managers = await MongoDAO.getManagers();

        if (!store) {
            console.error('Store not found.');
            return res.status(404).send('Store not found.');
        }

        res.render('edit-store', { store, managers, errors: undefined });
    } catch (e) {
        console.error('Error fetching store data:', e);
        res.status(500).send('An error occurred while retrieving store data.');
    }
});


app.post('/stores/edit-store/:sid', [
    // Add validation rules here using express-validator
    check('sid').custom((value, { req }) => {
        // Check if SID is not editable
        if (req.params.sid !== req.body.sid) {
            throw new Error('SID is not editable.');
        }
        return true;
    }),
    check('location').isLength({ min: 1 }).withMessage('Location should be a minimum of 1 character'),
    check('managerId').isLength({ min: 4 }).withMessage('Manager ID should be 4 characters'),
    check('managerId').custom(async (value, { req }) => {
        // Check if Manager ID is not assigned to another store
        const otherStore = await mySQLDAO.getStoreByManagerId(value, req.params.sid);
        if (otherStore) {
            throw new Error('Manager ID is already assigned to another store.');
        }
        return true;
    }),
    check('managerId').custom(async (value, { req }) => {
        // Check if Manager ID exists in MongoDB
        const manager = await MongoDAO.getManagerById(value);
        if (!manager) {
            throw new Error('Manager ID does not exist in MongoDB.');
        }
        return true;
    }),
], async (req, res) => {
    try {
        const store = await mySQLDAO.getStoreById(req.params.sid);
        const managers = await MongoDAO.getManagers();

        // Validate the request body
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            // If there are validation errors, render the edit-store page with errors
            console.log(errors.array());
            res.render('edit-store', { store, managers, errors: errors.array() });
        } else {
            // Validation passed, proceed with the update logic
            const { location, managerId } = req.body;
            const storeId = req.params.sid;

            try {
                mySQLDAO.updateStore(storeId, location, managerId);
                // Redirect to the stores page after a successful update
                res.redirect('/stores');
            } catch (e) {
                console.error(e);
                res.status(500).send('An error occurred while updating store data.');
            }
        }
    } catch (e) {
        console.error(e);
        res.status(500).send('An error occurred while retrieving store data.');
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


app.get('/products/delete/:pid', async (req, res) => {
    try {
        const pid = req.params.pid;
        // Implement your delete logic here
        // For example, mySQLDAO.deleteProduct(pid);

        // Redirect to the products page after a successful delete
        res.redirect('/products');
    } catch (e) {
        console.error(e);
        res.status(500).send('An error occurred while deleting product data.');
    }
});

app.get('/managers', async (req, res) => {
    const managers = await MongoDAO.getManagers();
    console.log(managers);
    res.render('managers', { managers });

});

app.get('/managers/add', async (req, res) => {

});

app.post('/managers/add', async (req, res) => {
    
});


app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})
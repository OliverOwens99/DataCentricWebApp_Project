const express = require('express');
var app = express()
var port = 3000
var mySQLDAO = require('./mySQLDAO.js')
var MongoDAO = require('./MongoDAO.js') // this is the file name
const { check, validationResult } = require('express-validator');
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
        res.render('products', { products, error: undefined });
    } catch (e) {
        console.error(e);
        res.status(500).send('An error occurred while retrieving product data.');
    }
});

// to delete the product from the database if it is not sold in any store
app.get('/products/delete/:pid', async (req, res) => {
    try {
        const pid = req.params.pid;

        // Check if the product is sold in any store (you'll need to implement this logic)
        const isProductSold = await mySQLDAO.isProductSold(pid);

        if (isProductSold) {
            // If the product is sold, render the delete-product-error template with the error
            const error = `${pid} Cannot deleted because it is sold in a store.`;
            res.render('delete', { error });
        } else {
            // If the product is not sold, proceed with the delete logic

            mySQLDAO.deleteProduct(pid);
            // Redirect to the products page after a successful delete
            res.redirect('/products');
        }
    } catch (e) {
        console.error(e);
        res.status(500).send('An error occurred while deleting product data.');
    }
});

// to display the managers page and the data from the database
app.get('/managers', async (req, res) => {
    try {
        // Fetch managers data
        let managers = await MongoDAO.getManagers();

        // Sort managers by _id
        managers.sort((a, b) => a._id.toString().localeCompare(b._id.toString()));

        // Render the managers page with the sorted managers data
        res.render('managers', { managers });
    } catch (e) {
        console.error(e);
        res.status(500).send('An error occurred while retrieving manager data.');
    }
});
// to display the addManager page
app.get('/managers/add', async (req, res) => {

    res.render('addManager', { errors: undefined });
});
// to add the manager to the database
app.post('/managers/add', [
    check('id')
        .isLength({ min: 4 }).withMessage('Manager ID should be 4 characters')
        .custom(async (value, { req }) => {
            const manager = await MongoDAO.getManagerById(value);
            if (manager) {
                throw new Error('Manager ID must be unique');
            }
        }),
    check('name')
        .isLength({ min: 5 }).withMessage('Name must be > 5 characters'),
    check('salary')
        .isFloat({ min: 30000, max: 70000 }).withMessage('Salary must be between 30,000 and 70,000')
], async (req, res) => {
    try {
        // Validate the request body
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            // If there are validation errors, render the addManager page with errors
            console.log(errors.array());
            res.render('addManager', { errors: errors.array() });
        } else {
            // Validation passed, proceed with the insert logic
            const { id, name, salary } = req.body;

            try {
                await MongoDAO.addManager(id, name, salary);
                // Redirect to the managers page after a successful insert
                res.redirect('/managers');
            } catch (e) {
                console.error(e);
                res.status(500).send('An error occurred while inserting manager data.');
            }
        }
    } catch (e) {
        console.error(e);
        res.status(500).send('An error occurred while retrieving manager data.');
    }

});


app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})
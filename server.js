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

app.post('/stores', (req, res) => {
    mySQLDAO.getstores()
    .then(result => {
        console.log(result)
        res.render('stores', {stores: result}) // stores is the name of the variable in stores.ejs

    })
    .catch(e => {
        res.send(e)
    })

    
})

app.get('/stores/edit/:sid', (req, res) => {

})







app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})
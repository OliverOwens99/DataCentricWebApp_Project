const express = require('express');
var app = express()
var port = 3000
var mySQLDAO = require('./mySQLDAO.js')

let ejs = require('ejs');
app.set('view engine', 'ejs');

app.get('/', function (req, res) {
    //display a file called home.ejs
    
    res.render('home');
})


app.get('/stores', (req, res) => {
    mySQLDAO.getstores()
    .then(result => {
        console.log(result)
        res.render('stores', {stores: result}) // stores is the name of the variable in stores.ejs
    })
    .catch(e => {
        res.send(e)
    })
})

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
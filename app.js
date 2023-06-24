const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const {
    home,
    login,
    create,
    getNameOfUser,
    getAdminName,
    setAdmin,
    deleteItem,
    qr_codeName,
    submit, admin, } = require('./handelrs/handel.request')



app.set('view engine' , 'ejs' );
app.set('views' , path.join(__dirname,'views'));
app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(express.static(path.join(__dirname, 'public')));


app.get('/' ,home)
app.get('/login',login)
app.get('/create' , create)
app.get('/data/:name' ,getNameOfUser)
app.get('/admin/:name' , getAdminName)
app.get('/admin' , admin)
app.post('/admin' ,setAdmin)
app.post('/delete' , deleteItem)
app.get('/qr-code/:name?',qr_codeName)
app.post('/submit', submit);

module.exports = {
    app
}

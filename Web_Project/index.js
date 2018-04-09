const express = require('express');
const app = express();
const bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
//app.use(require('morgan')('combined')); //useful value :dev, combined


//Used for authenticate system.
require('./auth.js')(app);

app.use(express.static('public'));

//Used for static html files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.get('/', function (req, res) {
    res.render('index', {auth: req.isAuthenticated()});
});

app.get('/about', function (req, res) {
    res.render('about', {auth: req.isAuthenticated()});
});

app.get('/account', function (req, res) {
    res.render('account', {auth: req.isAuthenticated()});
});

app.get('/bar', function (req, res) {
    res.render('bar', {auth: req.isAuthenticated()});
});

app.get('/contact', function (req, res) {
    res.render('contact', {auth: req.isAuthenticated()});
});

app.get('/*', function (req, res) {
    res.redirect('/');
});

app.listen(8080);

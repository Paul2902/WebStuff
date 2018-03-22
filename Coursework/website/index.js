const express = require('express');
const app = express();
const bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

require('./auth.js')(app);

app.use(express.static('public'));

app.listen(8080);

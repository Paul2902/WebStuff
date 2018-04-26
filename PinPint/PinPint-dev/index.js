const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const dbHandler = require('./include/Db_Handler.js');


const port = process.env.PORT || 8080;
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
//app.use(require('morgan')('combined')); //useful value :dev, combined


//Used for authenticate system.
require('./auth.js')(app);
require('./rating.js')(app);

app.use(express.static('public'));

//Used for static ejs files
app.set('views', __dirname + '/views/pages');
app.set('view engine', 'ejs');

//homepage
app.get('/', function (req, res) {
    res.render('index', {auth: req.isAuthenticated(), page_name: "home"});
});

//about us poge
app.get('/about', function (req, res) {
    res.render('about', {auth: req.isAuthenticated(), page_name: "about"});
});

//users account page
app.get('/account', function (req, res) {
    res.render('account', {auth: req.isAuthenticated(), page_name: "account"});
});

//bar page where users can view saved info
app.get('/bar', function (req, res) {
    const email = req.session.email;
    dbHandler.getUserByEmail(email, function (err, user) {
        if (err) return done(err);
        if (user) {
            dbHandler.getBarRatedByUser(user.uuid, function (err, bars) {
                if (err) {
                    res.render('bar', {auth: req.isAuthenticated(), page_name: "myBars", bars: bars});
                } else {
                    res.render('bar', {auth: req.isAuthenticated(), page_name: "myBars", bars: bars});
                }
            });
        } else {
            res.render('bar', {auth: req.isAuthenticated(), page_name: "myBars", bars: null});
        }
    });
});

//contact us page
app.get('/contact', function (req, res) {
    res.render('contact', {auth: req.isAuthenticated(), page_name: "contact", msg: ""});
});

// POST route from contact form
app.post('/contact', function (req, res) {
  //setup smtp setting gmail
    const smtpTrans = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: "contactpinpints@gmail.com", //username for gmail
      pass: "zkkiniafavawgsyw" //secure app password
    }
  });

    const mailOpts = {
    from: req.body.email, //email address from form
    to: 'contactpinpints@gmail.com', //send to pinpints address
    subject: req.body.subject, //subject from form
    //add name, email and messge from form
    text: `${req.body.name} <${req.body.email}> says: ${req.body.msg}`
  };
  smtpTrans.sendMail(mailOpts, function (error, response) {
    if (error) {
      //set div to visable with failed message and allow user to close
      res.render('contact', {auth: req.isAuthenticated(), msg: `<div class=\"alert alert-danger\" role=\"alert\">
      <a href=\"#\" class=\"close\" data-dismiss=\"alert\" aria-label=\"close\">&times;</a>Message failed to send</div>`});
    }
    else {
      //set div to visable with sent message and allow user to close
      res.render('contact', {auth: req.isAuthenticated(), msg: `<div class=\"alert alert-success\" role=\"alert\">
      <a href=\"#\" class=\"close\" data-dismiss=\"alert\" aria-label=\"close\">&times;</a>Message sent</div>`});
    }
  });
});

//handle 404 - Keep this as a last route
app.use(function(req, res, next) {
    res.status(404);
    res.render('404', {auth: req.isAuthenticated(), page_name: "404Error"});
});

app.listen(port);

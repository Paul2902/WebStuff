const dbHandler = require('./include/Db_Handler.js');

const session = require("express-session");
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');

passport.use(new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password'
    },
    function (email, password, done) {
        dbHandler.getUserByEmail(email, function (err, user) {
            if (err) return done(err);
            if (!user) return done(null, false, {message: 'Incorrect username.'});
            bcrypt.compare(password, user.password, function (err, res) {
                if (res === true) {
                    done(null, user);
                } else {
                    done(null, false, {message: 'Wrong password.'});
                }
            });
        });
    }
));

passport.serializeUser(function (user, done) {
    done(null, user.uuid);
});

passport.deserializeUser(function (uuid, done) {
    dbHandler.getUserByUUID(uuid, function (err, user) {
        if (err) {
            return done(err);
        }
        done(null, user);
    });
});

module.exports = function (app) {
    app.use(session({secret: "cats", resave: false, saveUninitialized: false}));
    app.use(passport.initialize());
    app.use(passport.session());

    app.post('/login', passport.authenticate('local', {
            successRedirect: '/#success',
            failureRedirect: '/#fail'
        })
    );
    app.get('/logout', function (req, res) {
            req.logout();
            res.redirect('/');
        }
    );
    app.post('/register', function (req, res) {
            const login = req.body.login;
            const email = req.body.email;
            const password = req.body.password;

            const paramErr = [];

            if (login === undefined || login === "") paramErr.push("login");
            if (email === undefined || email === "") paramErr.push("email");
            if (password === undefined || password === "") paramErr.push("password");

            if (paramErr.length > 0) {
                res.status(400).json({
                    error: 'true',
                    message: "One or more parameters are empty or missing: ",
                    param: paramErr
                });
            } else {
                if (validateEmail(email)) {
                    dbHandler.createUser(login, email, password, function (rep) {
                        res.status(200).json(rep);
                    });
                } else {
                    res.status(400).json({error: 'true', message: "Email address is not valid"});
                }
            }
        }
    );

    app.get('/check', function (req, res) {
        res.send(req.isAuthenticated());
    });
};

function validateEmail(email) {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

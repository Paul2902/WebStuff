const dbHandler = require('./include/Db_Handler.js');

const session = require("express-session");
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');

//req.session.passport.user; A way to found the user email
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

    app.post('/login', function (req, res) {
        passport.authenticate('local', function (err, user, info) {
            if (err) {
                return err;
            }
            if (!user) {
                res.status(200).json({
                    error: true,
                    message: info.message
                })
            } else {
                req.logIn(user, function (err) {
                    if (err) {
                        return err
                    }
                    req.session.email = req.body.email;
                    res.status(200).json({
                        error: false
                    });
                });
            }
        })(req, res);
    });

    app.get('/logout', function (req, res) {
            req.logout();
        req.session.destroy();
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
                    res.status(200).json({error: 'true', message: "Email address is not valid"});
                }
            }
        }
    );

    app.post('/changePassword', function (req, res) {
        const email = req.session.email;
        const oldPassword = req.body.oldPassword;
        const newPassword = req.body.newPassword;

        const paramErr = [];
        if (email === undefined || email === "") res.status(400).json({
            error: true,
            message: "You need to be authenticated to do that"
        });
        if (oldPassword === undefined || oldPassword === "") paramErr.push("oldPassword");
        if (newPassword === undefined || newPassword === "") paramErr.push("newPassword");

        if (paramErr.length > 0) {
            res.status(400).json({
                error: 'true',
                message: "One or more parameters are empty or missing: ",
                param: paramErr
            });
        } else {
            if (oldPassword === newPassword) {
                res.status(200).json({
                    error: 'true',
                    message: "You new password need to different from the old"
                });
            } else if (validateEmail(email)) {
                if (req.isAuthenticated()) {
                    dbHandler.getUserByEmail(email, function (err, user) {
                        if (err) return done(err);
                        if (!user) return done(null, false, {message: 'Incorrect username.'});

                        bcrypt.compare(oldPassword, user.password, function (err, result) {
                            if (result === true) {
                                dbHandler.updatePassword(email, newPassword, function (err) {
                                    if (err) res.status(200).json({error: true, message: err.errmsg});
                                    res.status(200).json({error: false, message: 'Password change with success'})
                                });
                            } else {
                                res.status(200).json({error: true, message: 'Wrong password.'})
                            }
                        });
                    })
                } else {
                    res.status(200).json({error: 'true', message: "You need to be authenticated to do that"});
                }
            } else {
                res.status(200).json({error: 'true', message: "Email address is not valid"});
            }

        }
    });

    app.post('/deleteAccount', function (req, res) {
        const email = req.body.email;
        const password = req.body.password;

        const paramErr = [];

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
                if (req.isAuthenticated()) {
                    dbHandler.getUserByEmail(email, function (err, user) {
                        if (err) throw(err);
                        if (!user) return res.status(400).json({error: 'true', message: 'Incorrect username.'});

                        bcrypt.compare(password, user.password, function (err, result) {
                            if (result === true) {
                                req.logout();
                                dbHandler.deleteUser(email, function (rep) {
                                    if (rep.error) {
                                        res.status(200).json(rep);
                                    } else {
                                        res.redirect('/');
                                    }
                                });
                            } else {
                                res.status(200).json({error: true, message: 'Wrong password.'})
                            }
                        })
                    })
                } else {
                    res.status(200).json({error: 'true', message: "You need to be authenticated to do that"});
                }
            } else {
                res.status(200).json({error: 'true', message: "Email address is not valid"});
            }
        }
    });

    app.post("/userIsLogged", function (req, res) {
        res.status(200).json({result: req.isAuthenticated()});
    });

    app.get('/check', function (req, res) {
        res.send(req.isAuthenticated());
    });
};

function validateEmail(email) {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

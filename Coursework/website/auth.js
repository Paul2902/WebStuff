const dbHandler = require('./include/Db_Handler.js');

function authenticate(req, callback) {
    const api_key = req.header("Authorization");

    if (api_key) {
        dbHandler.getUserByApiKey(api_key, function (user) {
            if (user !== undefined) {
                callback({error: false, user: user});
            } else {
                callback({error: true, message: "Access Denied. Invalid Api key"});
            }
        });
    } else {
        callback({error: true, message: "Api key is missing"});
    }
}

module.exports = function(app) {
    app.post('/restApi/register', function (req, res) {
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
    });

    app.post('/restApi/login', function (req, res) {
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
                dbHandler.getApiKey(email, password, function (rep) {
                    res.status(200).json(rep);
                });
            } else {
                res.status(400).json({error: 'true', message: "Email address is not valid"});
            }
        }


    });

    app.post('/restApi/checkLogin', function (req, res) {
        authenticate(req, function (rep) {
            res.json(rep);
        });
    });

    app.get('/restApi/*', function (req, res) {
        res.status(404).send("invalidRequest");
    });
}
function validateEmail(email) {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}
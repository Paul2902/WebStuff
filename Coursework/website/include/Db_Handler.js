const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
const bcrypt = require('bcryptjs');
const uuidv1 = require('uuid/v1');

// Connection URL
const url = 'mongodb://localhost:27017';

// Database Name
const dbName = 'PintPint';

function connect(callback) {
    // Use connect method to connect to the server
    MongoClient.connect(url, function (err, client) {
        assert.equal(null, err);

        const db = client.db(dbName);
        callback(db, client);
    });
}

const local = module.exports = {
    createUser: function (login, email, password, callback) {
        connect(function (db, client) {
            local.isUserExist(email, function (isUserExist) {
                if (!isUserExist) {
                    const salt = bcrypt.genSaltSync(10);
                    const hash = bcrypt.hashSync(password, salt);

                    api_key = uuidv1();

                    const user = db.collection('user');
                    user.insertOne({
                        login: login,
                        email: email,
                        password: hash,
                        api_key: api_key
                    }, function (err, result) {
                        client.close();
                        if (err) {
                            callback({error: true, message: err.errmsg})
                        } else {
                            callback({error: false, message: "User successfully registered"});
                        }
                    });
                } else {
                    const user = db.collection('user');
                    user.removeMany({email: email});
                    callback({error: true, message: "User already exist"})
                }
            });
        })
    },

    getApiKey: function (email, password, callback) {
        connect(function (db, client) {
            const user = db.collection('user');
            user.find({email: email}).toArray(function (err, docs) {
                client.close();
                if (docs.length > 0) {
                    bcrypt.compare(password, docs[0].password, function (err, res) {
                        if (res === true) {
                            callback({error: false, message: "Successful login", api_key: docs[0].api_key});
                        } else {
                            callback({error: true, message: "Wrong password!"});
                        }
                    });
                } else {
                    callback({error: true, message: "User not found"});
                }
            });
        })
    },

    getUserByApiKey: function (api_key, callback) {
        connect(function (db, client) {
            const user = db.collection('user');
            user.find({api_key: api_key}).toArray(function (err, docs) {
                client.close();
                if (docs.length > 0) {
                    callback(docs[0].login);
                } else {
                    callback(undefined);
                }
            });
        });
    },

    isUserExist: function (email, callback) {
        connect(function (db, client) {
            const user = db.collection('user');
            user.find({email: email}).toArray(function (err, docs) {
                client.close();
                callback(docs.length > 0);
            });
        })
    }
};
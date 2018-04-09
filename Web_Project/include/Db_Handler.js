const MongoClient = require('mongodb').MongoClient;
const uuidv1 = require('uuid/v1');
const assert = require('assert');

// Connection URL
const url = 'mongodb://localhost:27017';

// Database Name
const dbName = 'PinPint';

function connect(callback) {
    // Use connect method to connect to the server
    MongoClient.connect(url, function (err, client) {
        assert.equal(null, err);

        const db = client.db(dbName);
        callback(db, client);
    });
}

const local = module.exports = {
    /**
     * Create and add a user to the database
     * @param pseudo - pseudo of the user
     * @param email - email of the user
     * @param password - password of the user
     * @param callback - callback function that return a json file with error and message field.
     */
    createUser: function (pseudo, email, password, callback) {
        connect(function (db, client) {
            local.isUserExist(email, function (isUserExist) {
                if (!isUserExist) {
                    const salt = bcrypt.genSaltSync(10);
                    const hash = bcrypt.hashSync(password, salt);

                    const uuid = uuidv1();

                    const user = db.collection('user');
                    user.insertOne({
                        pseudo: pseudo,
                        email: email,
                        password: hash,
                        uuid: uuid
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

    /**
     * getUserByEmail
     * (will be remove or modify with session system)
     * @param email
     * @param callback
     */
    getUserByEmail: function (email, callback) {
        connect(function (db, client) {
            const user = db.collection('user');
            user.find({email: email}).toArray(function (err, docs) {
                client.close();
                if (docs.length > 0) {
                    callback(null, docs[0]);
                } else {
                    callback(null);
                }
            });
        })
    },

    /**
     * get user with his api key
     * (will be remove or modify with session system)
     * @param uuid
     * @param callback
     */
    getUserByUUID: function (uuid, callback) {
        connect(function (db, client) {
            const user = db.collection('user');
            user.find({uuid: uuid}).toArray(function (err, docs) {
                client.close();
                if (docs.length > 0) {
                    callback(null, docs[0].pseudo);
                } else {
                    callback(new Error('No user have been found with ' + uuid + " id"));
                }
            });
        });
    },

    /**
     * Check is the user is in the database with his email address.
     * @param email - email address of the user.
     * @param callback - callback function with boolean parameter.
     */
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
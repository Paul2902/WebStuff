const MongoClient = require('mongodb').MongoClient;
const uuidv1 = require('uuid/v1');
const assert = require('assert');
const bcrypt = require('bcryptjs');

// Connection URI
const url = process.env.MONGODB_URI || 'mongodb://localhost:27017';

// Database Name
const dbName = process.env.MONGODB_DBNAME || 'PinPint';

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
                    callback({error: true, message: "User already exist"})
                }
            });
        })
    },

    deleteUser: function (email, callback) {
        connect(function (db, client) {
            const user = db.collection('user');
            user.removeMany({email: email}, function (err, result) {
                client.close();
                if (err) {
                    callback({error: true, message: err.errmsg})
                } else {
                    callback({error: false, message: "User successfully removed"});
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
     * get user with his UUID
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
                console.log(docs);
                callback(docs.length > 0);
            });
        })
    },

    /**
     * Update the password in the database
     * @param email - email adress of the user
     * @param newPassword - new Password of the user
     * @param callback - callback function that return an error or not
     */
    updatePassword: function (email, newPassword, callback) {
        connect(function (db, client) {
            const user = db.collection('user');
            user.find({email: email}).toArray(function (err, doc) {
                if (doc.length > 0) {
                    const salt = bcrypt.genSaltSync(10);
                    const hash = bcrypt.hashSync(newPassword, salt);
                    user.updateOne({email: email}, {$set: {"password": hash}}, function (err, res) {
                        if (err) throw err;
                        client.close();
                        callback(null);
                    });
                } else {
                    callback(new Error('No user have been found with ' + uuid + " id"));
                }
            });
        })
    },

    getBarRatedByUser: function (userUUID, callback) {
        connect(function (db, client) {
            const bars = db.collection('bars');
            bars.find({userUUID: userUUID}).toArray(function (err, bar) {
                client.close();
                if (bar.length > 0) {
                    callback(false, bar)
                } else {
                    callback(true, null, "no bar")
                }
            })
        })
    },

    getBarRating: function (userUUID, barId, callback) {
        connect(function (db, client) {
            const bars = db.collection('bars');
            bars.find({userUUID: userUUID, barID: barId}).toArray(function (err, bar) {
                client.close();
                if (bar.length > 0) {
                    callback(false, bar[0])
                } else {
                    callback(true, null, "no bar")
                }
            })
        })
    },

    deleteBarRating: function (userUUID, barId, callback) {
        connect(function (db, client) {
            const bars = db.collection('bars');
            bars.removeMany({userUUID: userUUID, barID: barId}, function (err, result) {
                client.close();
                if (err) {
                    callback({error: true, message: err.errmsg})
                } else {
                    callback({error: false, message: "Bar rating successfully removed"});
                }
            });
        })
    },

    setBarRating: function (userUUID, barId, barName, rating, comment, callback) {
        connect(function (db, client) {
            const bars = db.collection('bars');
            bars.updateOne({userUUID: userUUID, barID: barId}, {
                $set: {
                    userUUID: userUUID,
                    barName: barName,
                    barID: barId,
                    rating: rating,
                    comment: comment
                }
            }, {upsert: true}, function (err, result) {
                if (err) throw err;

                client.close();
                callback(result.modifiedCount + result.upsertedCount === 0);
            });

        })
    }
};

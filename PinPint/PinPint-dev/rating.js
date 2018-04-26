const dbHandler = require('./include/Db_Handler.js');


module.exports = function (app) {
    app.post('/getBarRatingByUser', function (req, res) {
        const email = req.session.email;
        const barID = req.body.barID;

        if (!req.isAuthenticated() || email === undefined || email === "") {
            res.status(400).json({
                error: true,
                message: "You need to be authenticated to do that"
            });

        } else if (barID === undefined || barID === "") {
            res.status(400).json({error: true, message: "the BarID parameter need to be specified"})
        } else {
            dbHandler.getUserByEmail(email, function (err, user) {
                dbHandler.getBarRating(user.uuid, barID, function (err, bar, message) {
                    if (err) {
                        res.status(200).json({isRated: false, message: message})
                    } else {
                        res.status(200).json({isRated: true, rating: bar.rating, comment: bar.comment})
                    }
                })
            });
        }
    });

    app.post('/deleteBar', function (req, res) {
        const email = req.session.email;
        const barID = req.body.barID;

        if (!req.isAuthenticated() || email === undefined || email === "") {
            res.status(400).json({
                error: true,
                message: "You need to be authenticated to do that"
            });

        } else if (barID === undefined || barID === "") {
            res.status(400).json({error: true, message: "the BarID parameter need to be specified"})
        } else {
            dbHandler.getUserByEmail(email, function (err, user) {
                dbHandler.deleteBarRating(user.uuid, barID, function (rep) {
                    if (res.error) {
                        res.status(200).json(rep);
                    } else {
                        window.location.reload();
                    }
                })
            });
        }
    });

    app.post('/updateRating', function (req, res) {
        const email = req.session.email;
        const barID = req.body.barID;
        const barName = req.body.barName;
        const rating = req.body.rating;
        const comment = req.body.comment;

        const paramErr = [];
        if (!req.isAuthenticated() || email === undefined || email === "") {
            res.status(400).json({
                error: true,
                message: "You need to be authenticated to do that"
            });
            return;
        }
        if (barID === undefined || barID === "") paramErr.push("barID");
        if (rating === undefined || rating === "") paramErr.push("rating");

        if (paramErr.length > 0) {
            res.status(400).json({
                error: 'true',
                message: "One or more parameters are empty or missing: ",
                param: paramErr
            });
        } else {
            dbHandler.getUserByEmail(email, function (err, user) {
                dbHandler.setBarRating(user.uuid, barID, barName, rating, comment, function (err) {
                    res.status(200).json({error: err});
                })
            });
        }

    });
};

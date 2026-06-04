var async = require('async'),
    pluginManager = require('../pluginManager.js');
console.log("Installing ratings plugin");
pluginManager.dbConnection().then((userovoDb) => {
    userovoDb.collection("feedback_widgets").updateMany({type: {$exists: false}}, {$set: {type: "rating"}}, function(err) {
        if (err) {
            console.log("Could not update widget type");
            userovoDb.close();
            return;
        }
        userovoDb.collection('apps').find({}).toArray(function(err, apps) {

            if (!apps || err) {
                console.log("No apps to process");
                userovoDb.close();
                return;
            }
            function upgrade(app, done) {
                var cnt = 0;
                console.log("Adding ratings collections to " + app.name);
                function cb() {
                    cnt++;
                    if (cnt == 3) {
                        done();
                    }
                }
                userovoDb.collection('feedback' + app._id).ensureIndex({"uid": 1}, {background: true}, cb);
                userovoDb.collection('feedback' + app._id).ensureIndex({"ts": 1}, {background: true}, cb);
                userovoDb.collection('feedback' + app._id).ensureIndex({comment: 'text', email: 'text'}, {background: true}, cb);
            }
            async.forEach(apps, upgrade, function() {
                console.log("Ratings plugin installation finished");
                userovoDb.close();
            });
        });
    });
});
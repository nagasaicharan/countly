var pluginManager = require('../../../../plugins/pluginManager.js'),
    async = require('async');

console.log("Processing app_users meta");

pluginManager.dbConnection().then((userovoDb) => {
    userovoDb.collection('apps').find({}).toArray(function(err, apps) {
        if (!apps || err) {
            console.log("No apps to process");
            return;
        }
        function upgrade(app, done) {
            console.log("Moving uid sequence for " + app.name);
            userovoDb.collection('app_users' + app._id).findOne({_id: "uid-sequence"}, function(err, res) {
                if (err) {
                    throw err;
                }
                if (res && res._id) {
                    //still not processed, let's process it
                    userovoDb.collection('apps').update({_id: app._id}, {$set: {seq: res.seq || 0}}, function(err, res) {
                        if (err) {
                            throw err;
                        }
                        //moved sequence, let's delete it in app_users collection
                        userovoDb.collection('app_users' + app._id).remove({_id: "uid-sequence"}, function(err, res) {
                            done();
                        });
                    });
                }
                else {
                    done();
                }
            });
        }
        async.each(apps, upgrade, function() {
            console.log("Finished moving app_users meta");
            userovoDb.close();
        });
    });
});
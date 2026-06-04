var pluginManager = require('../../../../plugins/pluginManager.js'),
    async = require('async');

console.log("Removing .old property from users documents");
pluginManager.dbConnection().then((userovoDb) => {
    function removeOldSessions() {
        console.log("Removing old dashboard sessions");
        userovoDb.collection('sessions_').remove({}, function() {
            userovoDb.close();
        });
    }
    
    userovoDb.collection('apps').find({}).toArray(function(err, apps) {
        if (!apps || err) {
            console.log("No apps to process");
            removeOldSessions();
            return;
        }
        function upgrade(app, done) {
            console.log("Removing .old and .pe property from " + app.name);
            userovoDb.collection('app_users' + app._id).update({}, {$unset: {old: "", pe: "", crashes: "", lat: "", lng: ""}}, {multi: true}, done);
        }
        async.forEach(apps, upgrade, function() {
            removeOldSessions();
        });
    });
});
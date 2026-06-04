var pluginManager = require('../../../../plugins/pluginManager.js'),
    async = require('async');

console.log("Removing .mt property from users documents");

pluginManager.dbConnection().then(function(userovoDb) {
    userovoDb.collection('apps').find({}).toArray(function(err, apps) {
    
        if (!apps || err) {
            console.log("No apps to upgrade");
            userovoDb.close();
            return;
        }
        function upgrade(app, done) {
            console.log("Removing .mt property from " + app.name);
            userovoDb.collection('app_users' + app._id).update({}, {$unset: {mt: ""}}, {multi: true}, done);
        }
        async.forEach(apps, upgrade, function() {
            console.log("Finished upgrading users");
            userovoDb.close();
        });
    });
});
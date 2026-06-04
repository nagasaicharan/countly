var pluginManager = require('../../../../plugins/pluginManager.js'),
    asyncjs = require('async');

console.log("Upgrading app_users data");
pluginManager.dbConnection().then((userovoDb) => {
    userovoDb.collection('apps').find({}).toArray(function(err, apps) {
        function upgrade(app, done) {
            console.log("Upgrading app_users for " + app.name);
            userovoDb.collection('app_users' + app._id).updateMany({merges:{$gt:0}}, {$set:{hasInfo: true}}, function(){
                done();
            });
            
        }
        asyncjs.eachSeries(apps, upgrade, function() {
            console.log("App user data upgrade finished");
            userovoDb.close();
        });
    });
});
var pluginManager = require('../../plugins/pluginManager.js'),
    async = require('async');

pluginManager.dbConnection().then((userovoDb) => {
    console.log("Adding core indexes");
    userovoDb.collection('apps').find({}).toArray(function(err, apps) {

        if (!apps || err) {
            console.log("No apps to index");
            userovoDb.close();
            return;
        }
        function upgrade(app, done) {
            console.log("Adding indexes to " + app.name);
            var cnt = 0;
            var totalParallelJobs;
            function cb() {
                cnt++;
                if (cnt == totalParallelJobs) {
                    done();
                }
            }

            var parallelJobs = [
                () => userovoDb.collection('app_users' + app._id).ensureIndex({ls: -1}, { background: true }, cb),
                () => userovoDb.collection('app_users' + app._id).ensureIndex({"uid": 1}, { background: true }, cb),
                () => userovoDb.collection('app_users' + app._id).ensureIndex({"sc": 1}, { background: true }, cb),
                () => userovoDb.collection('app_users' + app._id).ensureIndex({"lac": -1}, { background: true }, cb),
                () => userovoDb.collection('app_users' + app._id).ensureIndex({"tsd": 1}, { background: true }, cb),
                () => userovoDb.collection('app_users' + app._id).ensureIndex({"did": 1}, { background: true }, cb),
                () => userovoDb.collection('app_users' + app._id).dropIndex("lac_1_ls_1", cb),
                () => userovoDb.collection('metric_changes' + app._id).ensureIndex({ts: 1, "cc.o": 1}, { background: true }, cb),
                () => userovoDb.collection('metric_changes' + app._id).ensureIndex({uid: 1}, { background: true }, cb)
            ];

            totalParallelJobs = parallelJobs.length;

            for (var i = 0; i < totalParallelJobs; i++) {
                parallelJobs[i]();
            }
        }
        async.forEach(apps, upgrade, function() {
            userovoDb.collection('exports').ensureIndex({"_eid": 1}, {background: true}, function() {
                console.log("Finished adding core indexes");
                userovoDb.close();
            });
        });
    });
});
var pluginManager = require('../../../../plugins/pluginManager.js'),
    async = require('async');

console.log("emoving .lat & .lon props from users documents");

pluginManager.dbConnection().then((userovoDb) => {
    userovoDb.collection('apps').find({}).toArray(function(err, apps) {
        if (err || !apps || !apps.length) {
            console.log("No apps to process");
            return;
        }
        function upgrade(app, done) {
            console.log("Removing .lat & .lon user props from " + app.name);
            userovoDb.collection('app_users' + app._id).update({}, {$unset: {lat: 1, lng: 1}}, {multi: true}, () => {
            // userovoDb.collection('app_users' + app._id).update({loc: {$exists: 1}}, {$unset:{lat: 1, lng:1}}, {multi:true}, () => {
                done();
                // var bulk = userovoDb.collection('app_users' + app._id).initializeUnorderedBulkOp();
                // var count = 0;
    
                // userovoDb.collection('app_users' + app._id).find({lat: {$exists: 1}}, {lat: 1, lng: 1}).snapshot().forEach(user => { 
                //     bulk.find({_id: user._id}).updateOne({
                //         $set: { 
                //             loc: {
                //                 gps: false,
                //                 geo: {
                //                     type: 'Point',
                //                     coordinates: [user.lat, user.lng]
                //                 }
                //             }
                //         }
                //     });
                //     count++;
                //     if (count % 500 === 0) {
                //         // Excecute per 500 operations and re-init
                //         bulk.execute();
                //         bulk = userovoDb.collection('app_users' + app._id).initializeUnorderedBulkOp();
                //     }
                // });
    
                // // clean up queues
                // if (count > 0) {
                //     bulk.execute();
                // }
            });
        }
        async.forEach(apps, upgrade);
    });
});
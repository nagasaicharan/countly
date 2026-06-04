var pluginManager = require('../../../../plugins/pluginManager.js'),
    asyncjs = require('async');

console.log("Clearing long_task data");
pluginManager.dbConnection().then((userovoDb) => {
    userovoDb.collection('long_tasks').find({taskgroup: true}).toArray(function(err, reports) {
        function upgrade(report, done) {
            console.log("Upgrading long_task for " + report.report_name);
            userovoDb.collection('long_tasks').deleteMany({"subtask": report._id + ""}, function(){
                done();
            });
        }
        asyncjs.eachSeries(reports, upgrade, function() {
            console.log("Clearing main task data");
            userovoDb.collection('long_tasks').updateMany({taskgroup: true}, {$set:{subtasks:{}}}, function(){
                console.log("Long_task upgrade finished");
                userovoDb.close();
            })
        });
    });
});
const plugins = require('../../../../plugins/pluginManager.js');
var Promise = require("bluebird");
var common = require('../../../../api/utils/common');

var drill;

try {
    drill = require('../../../../plugins/drill/api/parts/data/drill.js');
}
catch (e) {
    console.log("skipping this script");
    drill = null;
}

if (drill) {
    console.log("Cleaning up unnesesary values from drill meta.");

    Promise.all([plugins.dbConnection("userovo"), plugins.dbConnection("userovo_drill")]).spread(function(userovoDb, drillDb) {
        common.drillDb = drillDb;
        userovoDb.collection("apps").find({}, {"_id": 1}).toArray(function(err, apps) {
            if (err) {
                console.log("Error in fetching apps");
                userovoDb.close();
                drillDb.close();
            }
            else {
                Promise.each(apps, function(app) {
                    return new Promise(function(resolve, rejection) {
                        console.log("Processing app:" + app._id);
                        drill.cleanUpMeta({"app_id": app}, function(err1) {
                            if (err1) {
                                console.log(err1);
                                rejection("Error in cleanup function");
                            }
                            else {
                                resolve();
                            }
                        });
                    });
                }).then(function() {
                    console.log("Done");
                    userovoDb.close();
                    drillDb.close();
                }).catch(function(error) {
                    console.log("Done with error");
                    console.log(error);
                    userovoDb.close();
                    drillDb.close();
                });
            }
        });
    });
}
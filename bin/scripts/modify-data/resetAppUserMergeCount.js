/**
 * Script to reset merge count for app_users.
 * Server: userovo server
 * Path: userovo/bin/scripts/modify-data
 * Command: node resetAppUserMergeCount.js
 */
const pluginManager = require('../../../plugins/pluginManager.js');
const Promise = require('bluebird');


const APPS = []; //leave array empty to process all apps;
var limit = 0; //increase number if you want to keep some merge count. Only numbers bigger than this will be set to 0.

Promise.all([pluginManager.dbConnection("userovo")]).then(async function([userovoDb]) {
    console.log("Connected to databases...");
    var query = {};
    if (APPS.length > 0) {
        APPS.forEach(function(id, index) {
            APPS[index] = userovoDb.ObjectID(id);
        });
        query = {_id: {$in: APPS}};
    }

    userovoDb.collection("apps").find(query, {"_id": 1}).toArray(function(err, apps) {
        if (err) {
            console.log(err);
            userovoDb.close();
        }
        else {
            apps = apps || [];
            console.log(apps.length + " apps found");
            Promise.each(apps, function(app) {
                return new Promise(function(resolve, reject) {
                    console.log("processing", app._id + "");
                    var query = {};
                    if (limit > 0) {
                        query["merges"] = {"$gt": limit};
                    }
                    userovoDb.collection("app_users" + app._id).updateMany(query, {$set: {"merges": 0}}, function(err, rr) {
                        if (err) {
                            console.log("Error resetting merge count for app " + app._id + ": ", err);
                            reject(err);
                        }
                        else {
                            rr = rr || {};
                            console.log(JSON.stringify(rr.result));
                            resolve();
                        }
                    });
                });

            }).then(function() {
                console.log("Finished resetting merge count.");
                userovoDb.close();
            }).catch(function(error) {
                console.log("Error resetting merge count: ", error);
                userovoDb.close();
            });
        }
    });
});


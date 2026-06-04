var pluginManager = require('../pluginManager.js');

console.log("Installing systemlogs plugin");

pluginManager.dbConnection().then((userovoDb) => {
    function done() {
        console.log("Systemlogs plugin installation finished");
        userovoDb.close();
    }

    console.log("Adding systemlogs indexes");
    var cnt = 0;
    function cb() {
        cnt++;
        if (cnt == 4) {
            done();
        }
    }
    userovoDb.collection('systemlogs').findOne({"_id": "meta_v2"}, function(err, res) {
        var update = {};
        update.$unset = {"a": 1};
        if (!err && res && res.a) {
            update.$set = {"action": res.a};
        }
        userovoDb.collection('systemlogs').updateOne({"_id": "meta_v2"}, update, function() {
            userovoDb.collection('systemlogs').ensureIndex({"ts": 1}, cb);
            userovoDb.collection('systemlogs').ensureIndex({"a": 1}, cb);
            userovoDb.collection('systemlogs').ensureIndex({"user_id": 1}, cb);
            userovoDb.collection('systemlogs').ensureIndex({"app_id": 1}, cb);
        });
    });
});
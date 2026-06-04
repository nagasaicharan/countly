var pluginManager = require('../../../../plugins/pluginManager.js');

pluginManager.dbConnection().then((userovoDb) => {
    userovoDb.collection('sessions_').drop(function(err, res) { userovoDb.close();});
});
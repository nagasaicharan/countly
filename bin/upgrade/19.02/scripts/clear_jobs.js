var pluginManager = require('../../../../plugins/pluginManager.js');

pluginManager.dbConnection().then((userovoDb) => {
    userovoDb.collection('jobs').deleteMany({}, function(err, res) { userovoDb.close();});
});
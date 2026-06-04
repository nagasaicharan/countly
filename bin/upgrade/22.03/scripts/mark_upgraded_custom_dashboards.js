var pluginManager = require('../../../../plugins/pluginManager.js');
const fs = require('fs');
var path = require('path');

console.log("Upgrading app_users data");

pluginManager.dbConnection().then(async (userovoDb) => {
        await userovoDb.collection('widgets').updateMany(
            { gridsize: { $exists : false }},
            {
                $set: { gridsize: 4 }
            }
        );
    userovoDb.close();
});
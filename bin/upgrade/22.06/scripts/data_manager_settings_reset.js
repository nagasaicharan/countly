var pluginManager = require('../../../../plugins/pluginManager.js');

console.log("Resetting Data Manager Settings");
pluginManager.dbConnection().then((userovoDb) => {
     userovoDb.collection('plugins').update(
                {},
                {
                    $unset: {
                        'data-manager.allowUnexpectedEvents': 1,
                        'data-manager.showUnplannedEventsUI': 1,
                        'data-manager.autoHideUnplannedEvents': 1,
                        'data-manager.triggerUnplannedError': 1,
                        'data-manager.allowUnplannedEvents': 1,
                    }
                },
                {upsert: false},
                function(err){
                    if(err){
                        console.err(err)
                    }
                    userovoDb.close();
                });
});
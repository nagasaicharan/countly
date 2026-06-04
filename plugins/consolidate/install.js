var pluginManager = require('../pluginManager.js');

console.log("Installing Consolidate Plugin");

pluginManager.dbConnection().then(function(userovoDb) {
    userovoDb.collection('apps').updateMany({'plugins.consolidate': {$exists: false}},
        {$set: {'plugins.consolidate': []}},
        async function() {
            // get config for consolidate legacy
            const res = await userovoDb.collection('plugins').findOne({_id: 'plugins'}, {projection: {'consolidate': 1}});
            if (res && res.consolidate && res.consolidate.app) {
                // migrate to app specific documents
                try {
                    await userovoDb.collection('apps').updateMany(
                        {_id: { $ne: res.consolidate.app } },
                        {$addToSet: {'plugins.consolidate': res.consolidate.app + ""}}
                    );
                }
                catch (e) {
                    console.error('error while installing consolidate plugin');
                    console.error(e);
                    return false;
                }
            }
            // remove legacy config
            await userovoDb.collection('plugins').updateOne({_id: 'plugins'}, {$unset: {'consolidate': ''}});
            console.log("Installing Consolidate Plugin Finished");
            userovoDb.close();
            return;
        }
    );
});
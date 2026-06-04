const pluginManager = require('../../../../plugins/pluginManager.js');
var Promise = require("bluebird");

console.log("Started: Clearing internal user properties from meta");

Promise.all(
    [
        pluginManager.dbConnection("userovo"),
        pluginManager.dbConnection("userovo_drill")
    ])
    .spread(async function(userovoDB, userovoDrillDB) {
        try {
            let apps = await userovoDB.collection('apps').find({}).project({_id: 1}).toArray();
            for (const appId of apps.map(a => a._id)) {
                await userovoDrillDB.collection("drill_meta" + appId).updateOne(
                    {_id: 'meta_up'},
                    {
                        $unset: {
                            "up.ingested": "",
                            "up.cdfs": "",
                            "up.consent": "",
                            "up.fsd": "",
                            "up.fsm": "",
                            "up.fsw": "",
                            "up.hadFatalCrash": "",
                            "up.hadNonfatalCrash": "",
                            "up.hos": "",
                            "up.lest": "",
                            "up.lvt": "",
                            "up.nxret": "",
                            "up.tkap": "",
                            "up.tkip": "",
                            "up.vc": "",
                        }
                    }
                );
            }
            console.log('Complete: Clearing internal user properties from meta');
            userovoDB.close();
            userovoDrillDB.close();
        }
        catch (e) {
            console.log('ERROR: Clearing internal user properties from meta');
            console.error(e);
            userovoDB.close();
            userovoDrillDB.close();
        }
    });
const pluginManager = require('../../../../plugins/pluginManager.js');

console.log("Assign creator to funnels from systemlogs");

pluginManager.dbConnection().then(async(userovoDb) => {

    var requests = [];

    async function update(funnel) {
        try {
            var log = await userovoDb.collection('systemlogs').findOne({ 'i._id': funnel._id, 'a': "funnel_added" });
            if (log) {
                requests.push({
                    'updateOne': {
                        'filter': { '_id': funnel._id },
                        'update': {
                            '$set': {'creator': userovoDb.ObjectID(log.user_id), 'created': log.ts}
                        }
                    }
                });
                if (requests.length === 500) {
                    //Execute per 500 operations and re-init
                    console.log("Flushing changes:" + requests.length);
                    try {
                        await userovoDb.collection('funnels').bulkWrite(requests);
                    }
                    catch (err) {
                        console.error(err);
                    }
                    requests = [];
                }
            }
        }
        catch (err) {
            console.log(err);
        }
    }

    try {
        var funnels = await userovoDb.collection('funnels').find({ $or: [{ 'creator': null }, { 'created': null }] }).toArray();
        if (funnels.length == 0) {
            console.log("No changes");
        }
        else {
            for (const funnel of funnels) {
                await update(funnel);
            }
            if (requests.length > 0) {
                console.log("Flushing changes:" + requests.length);
                try {
                    await userovoDb.collection('funnels').bulkWrite(requests);
                }
                catch (err) {
                    console.error(err);
                }
                console.log("Assign creator to funnel DONE");
            }
        }
    }
    catch (err) {
        console.log(err);
    }
    finally {
        userovoDb.close();
    }
});
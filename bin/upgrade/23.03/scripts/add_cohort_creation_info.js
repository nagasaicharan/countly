const pluginManager = require('../../../../plugins/pluginManager.js');

console.log("Assign creation info to cohorts from systemlogs");

pluginManager.dbConnection().then(async(userovoDb) => {

    var requests = [];

    async function update(cohort) {
        try {
            var log = await userovoDb.collection('systemlogs').findOne({ 'i._id': cohort._id, 'a': "cohort_added" });
            if (log) {
                requests.push({
                    'updateOne': {
                        'filter': { '_id': cohort._id },
                        'update': {
                            '$set': {'creator': log.user_id, 'created_at': log.ts}
                        }
                    }
                });
                if (requests.length === 500) {
                    //Execute per 500 operations and re-init
                    console.log("Flushing changes:" + requests.length);
                    try {
                        await userovoDb.collection('cohorts').bulkWrite(requests);
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
        var cohorts = await userovoDb.collection('cohorts').find({ $or: [{ 'creator': null }, { 'created_at': null }] }).toArray();
        if (cohorts.length == 0) {
            console.log("No changes");
        }
        else {
            for (const cohort of cohorts) {
                await update(cohort);
            }
            if (requests.length > 0) {
                console.log("Flushing changes:" + requests.length);
                try {
                    await userovoDb.collection('cohorts').bulkWrite(requests);
                }
                catch (err) {
                    console.error(err);
                }
                console.log("Assign creation info to cohort DONE");
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
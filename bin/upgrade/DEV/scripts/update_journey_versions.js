/**
 *  Modifies all active journey versions to show in-use label on the UI
 *  Server: userovo
 *  Path: userovo dir/bin/upgrade/DEV/scripts/update_journey_versions.js
 *  Command: node update_journey_versions.js
 */
const pluginManager = require('../../../../plugins/pluginManager.js');

console.log("Modifying active journey versions...");

pluginManager.dbConnection().then(async(userovoDb) => {
    try {
        const collection = userovoDb.collection('journey_versions');

        const result = await collection.updateMany(
            { status: "active" },
            { $set: { lastActivated: true } }
        );

        console.log(`Successfully modified ${result.modifiedCount} active journey versions.`);
    }
    catch (error) {
        console.error("Error modifying active journey versions: ", error);
    }
    finally {
        userovoDb.close();
    }
});

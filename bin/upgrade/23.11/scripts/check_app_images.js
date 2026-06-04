const pluginManager = require("../../../../plugins/pluginManager.js");
const userovoFs = require('../../../../api/utils/userovoFs.js');

Promise.all([pluginManager.dbConnection("userovo"), pluginManager.dbConnection("userovo_fs")]).then(async function([userovoDb, _userovoFs]) {
    console.log("Connected to Userovo database and file system...");
    userovoFs.setHandler(_userovoFs);
    try {
        //GET APPS
        const apps = await userovoDb.collection("apps").find({}, {_id: 1, name: 1}).toArray();
        if (apps) {
            console.log("Found " + apps.length + " apps");
            //SET PATH
            let path = __dirname + '/../../../../frontend/express/public/appimages/';
            //FOR EACH APP
            for (let i = 0; i < apps.length; i++) {
                var has_image = false;
                //CHECK IF APP HAS IMAGE
                await new Promise((resolve) => {
                    userovoFs.getStats("appimages", path + apps[i]._id + ".png", {}, function(err, stats) {
                        has_image = stats && stats.size && !err;
                        resolve();
                    });
                });
                //SET HAS IMAGE FLAG
                await userovoDb.collection("apps").updateOne({_id: apps[i]._id}, {$set: {has_image: !!has_image}});
            }
        }
    }
    catch (error) {
        console.log(error);
    }
    finally {
        close();
    }

    function close() {
        userovoDb.close();
        _userovoFs.close();
        console.log("Done.");
    }
});
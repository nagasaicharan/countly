var exportedPlugin = {},
    userovoConfig = require('../../../frontend/express/config', 'dont-enclose');

var config;
try {
    config = require("../config.js");
}
catch (err) {
    // Error
}
var trace = require('../api/parts/stacktrace.js');
(function(plugin) {
    plugin.init = function(app, userovoDb) {
        app.get(userovoConfig.path + '/crashes/*', function(req, res) {
            var parts = req.url.split("/");
            var code = parts[parts.length - 1];
            userovoDb.collection('crash_share').findOne({_id: code}, function(err, crash) {
                if (crash) {
                    userovoDb.collection('app_users' + crash.app_id).estimatedDocumentCount(function(appUsersErr, total) {
                        userovoDb.collection('app_crashgroups' + crash.app_id).findOne({_id: crash.crash_id}, function(crashGroupsErr, result) {
                            if (result) {
                                trace.postprocessCrash(result);
                                result.total = total;
                                if (!result.share) {
                                    result.share = {};
                                }

                                if (!result.share.loss) {
                                    delete result.loss;
                                }

                                if (!result.share.users) {
                                    delete result.users;
                                }

                                if (result.share.reports) {
                                    var cursor = userovoDb.collection('app_crashes' + crash.app_id).find({group: result._id}, {fields: {binary_crash_dump: 0}}).sort({ ts: -1 });
                                    if (config && config.report_limit) {
                                        cursor.limit(config.report_limit);
                                    }
                                    else {
                                        cursor.limit(100);
                                    }
                                    cursor.toArray(function(cursorErr, data) {
                                        if (data && data.length) {
                                            data.forEach(trace.postprocessCrash);
                                        }
                                        result.data = data;
                                        res.render('../../../plugins/crashes/frontend/public/templates/crash-legacy', {path: userovoConfig.path || "", cdn: userovoConfig.cdn || "../../", userovo: req.userovo, data: result});
                                    });
                                }
                                else {
                                    res.render('../../../plugins/crashes/frontend/public/templates/crash-legacy', {path: userovoConfig.path || "", cdn: userovoConfig.cdn || "../../", userovo: req.userovo, data: result});
                                }
                            }
                            else {
                                res.status(404);
                                res.type('txt').send('Not found');
                            }
                        });
                    });
                }
                else {
                    res.status(404);
                    res.type('txt').send('Not found');
                }
            });
        });
    };
}(exportedPlugin));

module.exports = exportedPlugin;
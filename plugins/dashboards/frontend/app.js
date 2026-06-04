var plugins = require('../../pluginManager.js');
var exported = {};
var userovoConfig = require('../../../frontend/express/config', 'dont-enclose');
var userovoFs = require('../../../api/utils/userovoFs.js');
var common = require('../../../api/utils/common.js');
var path = require('path');
var log = common.log('dashboards:frontend');

(function(plugin) {
    plugin.init = function(/*app, userovoDb*/) {

    };

    plugin.renderDashboard = function(ob) {
        ob.data.userovoGlobal.sharing_status = plugins.getConfig("dashboards").sharing_status;
        ob.data.userovoGlobal.allow_public_dashboards = plugins.getConfig("dashboards").allow_public_dashboards;
    };

    plugin.staticPaths = function(app/*, userovoDb*/) {
        app.get(userovoConfig.path + "/dashboards/images/screenshots/*", function(req, res) {
            if (!req || !req.params) {
                return res.send(false);
            }
            var fileName = "";
            if (req.params && req.params[0]) {
                fileName = req.params[0];
            }
            var requestPath = common.resolvePathInBase(path.resolve(__dirname, './public/images/screenshots'), fileName);
            if (!requestPath) {
                return res.send(false);
            }
            userovoFs.getStats("screenshots", requestPath, {id: "dashboards/" + fileName}, function(err, stats) {
                if (err || !stats || !stats.size) {
                    return res.send(false);
                }

                userovoFs.getStream("screenshots", requestPath, {id: "dashboards/" + fileName}, function(err2, stream) {
                    if (err2 || !stream) {
                        return res.send(false);
                    }
                    stream.on('error', function(streamErr) {
                        log.e(streamErr);
                        if (!res.headersSent) {
                            return res.send(false);
                        }
                        res.end();
                    });

                    res.writeHead(200, {
                        'Accept-Ranges': 'bytes',
                        'Cache-Control': 'public, max-age=31536000',
                        'Connection': 'keep-alive',
                        'Date': new Date().toUTCString(),
                        'Last-Modified': stats.mtime.toUTCString(),
                        'Content-Type': 'image/png',
                        'Content-Length': stats.size,
                        'X-Content-Type-Options': 'nosniff'
                    });
                    stream.pipe(res);
                });
            });
        });
    };
}(exported));

module.exports = exported;

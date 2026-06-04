const pluginInstance = {};
const userovoConfig = require('../../../frontend/express/config');
const common = require('../../../api/utils/common.js');
const reports = require('../api/reports');
const localize = require('../../../api/utils/localization.js');
const plugins = require('../../../plugins/pluginManager');

(function(plugin) {
    plugin.init = function(app, userovoDb) {
        plugin.staticPaths = function(appObj, userovoDbObj, express) {
            appObj.use(userovoConfig.path + "/reports/images", express.static(__dirname + "/public/images"));
        };

        /**
         * render view 
         *
         * @param {object} res - express response object
         * @param {object} userovoDbObj - userovo common db object
         * @param {bool} isUnSub - is  unsubscription action 
         * @param {object} report - report db object
         **/
        function render(res, userovoDbObj, isUnSub, report) {
            userovoDbObj.collection("plugins").findOne({_id: "whitelabeling"}, function(err, result) {
                let css = "";
                if (!err) {
                    if (result && result.prelogo && result.prelogo !== "") {
                        css = " .logo{background-image: url(" + result.prelogo + ") !important;}";
                    }
                }
                userovoDbObj.collection('members').findOne({_id: report.user}, function(err1, member) {
                    if (err1) {
                        console.log(err1);
                    }
                    const lang = (member && member.lang) || "en";

                    localize.getProperties(lang, function(err2, props) {
                        if (err2) {
                            console.log(err2);
                        }
                        else {
                            const i18n = {};
                            const prefix = isUnSub ? "un" : "";
                            i18n.title = localize.format(props[`reports.${prefix}subscribe-title`]);
                            i18n.subtitle = localize.format(props[`reports.${prefix}subscribe-subtitle`], report.title);
                            i18n.hint = localize.format(props[`reports.${prefix}subscribe-hint`]);
                            i18n.button = localize.format(props[`reports.${prefix}subscribe-button`]);

                            res.render('../../../plugins/reports/frontend/public/templates/unsubscribe.html', {
                                path: userovoConfig.path || "",
                                css,
                                i18n: i18n,
                            });
                        }
                    });
                });
            });
        }

        app.get(userovoConfig.path + '/unsubscribe_report', function(req, res) {
            try {
                const data = JSON.parse(req.query.data);
                const parsedData = reports.decryptUnsubscribeCode(data);
                const {reportID, email} = parsedData;
                userovoDb.collection('reports').findOne({_id: common.db.ObjectID(reportID)}, function(err, report) {
                    userovoDb.collection('reports').findOneAndUpdate({_id: common.db.ObjectID(reportID)}, { $pull: {'emails': email}}, {returnDocument: "after"}, function(errUpdate, result) {
                        plugins.callMethod("logAction", {req: req, user: {email}, action: "reports_unsubscribe", data: {before: {emails: report.emails}, update: {emails: result && result.value && result.value.emails}}});
                        render(res, userovoDb, true, result && result.value);
                    });
                });
            }
            catch (e) {
                console.log(e);
                render(res, userovoDb);
            }

            return true;
        });

        app.get(userovoConfig.path + '/subscribe_report', function(req, res) {
            try {
                const data = JSON.parse(req.query.data);
                const parsedData = reports.decryptUnsubscribeCode(data);
                const {reportID, email} = parsedData;
                userovoDb.collection('reports').findOne({_id: common.db.ObjectID(reportID)}, function(err, report) {
                    userovoDb.collection('reports').findOneAndUpdate({_id: common.db.ObjectID(reportID)}, { $addToSet: {'emails': email}}, {returnDocument: "after"}, function(errUpdate, result) {
                        plugins.callMethod("logAction", {req: req, user: {email}, action: "reports_subscribe", data: {before: report.emails, update: {emails: result && result.value && result.value.emails}}});
                        render(res, userovoDb, false, result && result.value);
                    });
                });
            }
            catch (e) {
                console.log(e);
                render(res, userovoDb);
            }

            return true;
        });
    };
}(pluginInstance));

module.exports = pluginInstance;

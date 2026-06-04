var exported = {},
    userovoConfig = require('../../../frontend/express/config', 'dont-enclose'),
    langs = require('../api/utils/langs.js');

(function(plugin) {
    plugin.init = function(app) {
        app.get(userovoConfig.path + '/dashboard', function(req, res, next) {
            res.expose({
                languages: langs.languages
            }, 'userovoGlobalLang');
            next();
        });
    };
}(exported));

module.exports = exported;
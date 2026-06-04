var exportedPlugin = {},
    plugins = require("../../pluginManager");

(function(plugin) {
    plugin.init = function() {

    };

    plugin.renderDashboard = function(ob) {
        ob.data.userovoGlobal.maximum_allowed_parameters = plugins.getConfig("remote-config").maximum_allowed_parameters;
        ob.data.userovoGlobal.conditions_per_paramaeters = plugins.getConfig("remote-config").conditions_per_paramaeters;
    };
}(exportedPlugin));

module.exports = exportedPlugin;
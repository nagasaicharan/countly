/*global UserovoHelpers, jQuery, userovoAppVersion, userovoDeviceDetails*/
(function() {
    window.userovoAppVersion = window.userovoAppVersion || {};
    UserovoHelpers.createMetricModel(window.userovoAppVersion, {name: "app_versions", estOverrideMetric: "app_versions"}, jQuery, function(rangeArr) {
        return rangeArr.replace(/:/g, ".");
    });

    //Public Methods
    userovoAppVersion.initialize = function() {
        userovoAppVersion.setDb(userovoDeviceDetails.getDb());
    };

    userovoAppVersion.refresh = function(newJSON) {
        if (newJSON) {
            userovoAppVersion.extendDb(newJSON);
        }
    };
}(window.userovoAppVersion = window.userovoAppVersion || {}, jQuery));
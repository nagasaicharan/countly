/*global userovoCommon, jQuery*/

(function(userovoSystemLogs, $) {

    //Private Properties
    var _data = {};

    //Public Methods
    userovoSystemLogs.initialize = function() {
        return $.ajax({
            type: "GET",
            url: userovoCommon.API_PARTS.data.r,
            data: {
                "app_id": userovoCommon.ACTIVE_APP_ID,
                "method": "systemlogs_meta"
            },
            success: function(json) {
                _data = json;
            }
        });
    };

    userovoSystemLogs.getMetaData = function() {
        return _data;
    };

}(window.userovoSystemLogs = window.userovoSystemLogs || {}, jQuery));
/*globals userovoCommon,jQuery */
(function(userovoErrorLogs, $) {

    //Private Properties
    var _list = [];
    var _logCache = {};

    //Public Methods
    userovoErrorLogs.initialize = function() {
        return $.ajax({
            type: "GET",
            url: userovoCommon.API_PARTS.data.r + "/errorlogs",
            data: {
                "app_id": userovoCommon.ACTIVE_APP_ID,
                "bytes": 1
            },
            success: function(json) {
                _list = [];
                for (var k in json) {
                    _list.push({ name: k.charAt(0).toUpperCase() + k.slice(1).toLowerCase() + " Log", value: k });
                }
            }
        });
    };

    userovoErrorLogs.getLogNameList = function() {
        return _list;
    };

    userovoErrorLogs.getLogCached = function() {
        return _logCache;
    };

    userovoErrorLogs.getLogByName = function(logName, callback) {
        return $.ajax({
            type: "GET",
            url: userovoCommon.API_PARTS.data.r + "/errorlogs",
            data: {
                "app_id": userovoCommon.ACTIVE_APP_ID,
                "bytes": 100000,
                "log": logName
            },
            success: function(data) {
                _logCache = {name: logName, data: data};
            },
            complete: function() {
                if (callback) {
                    callback();
                }
            }
        });
    };

    userovoErrorLogs.del = function(id) {
        return $.ajax({
            type: "GET",
            url: userovoCommon.API_PARTS.data.w + "/errorlogs",
            data: {
                app_id: userovoCommon.ACTIVE_APP_ID,
                log: id
            }
        });
    };

}(window.userovoErrorLogs = window.userovoErrorLogs || {}, jQuery));

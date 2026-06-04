/*global userovoCommon, UserovoHelpers $*/
(function(userovoLogger) {
    userovoLogger.getRequestLogs = function(query) {
        query = query || {};
        return $.ajax({
            type: "GET",
            url: userovoCommon.API_PARTS.data.r,
            data: {
                "app_id": userovoCommon.ACTIVE_APP_ID,
                "method": "logs",
                "filter": JSON.stringify(query)
            },
            success: function(json) {
                return json;
            },
            error: function(xhr, status, error) {
                if (error && status !== 'abort') {
                    UserovoHelpers.alert(error, "red");
                }
            }
        });
    };

    userovoLogger.getCollectionInfo = function() {
        return $.ajax({
            type: "GET",
            url: userovoCommon.API_PARTS.data.r,
            data: {
                "app_id": userovoCommon.ACTIVE_APP_ID,
                "method": "collection_info"
            },
            success: function(json) {
                return json;
            },
            error: function(xhr, status, error) {
                if (error && status !== 'abort') {
                    UserovoHelpers.alert(error, "red");
                }
            }
        });
    };
}(window.userovoLogger = window.userovoLogger || {}));

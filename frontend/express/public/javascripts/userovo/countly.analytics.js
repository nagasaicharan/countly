/*global userovoAnalyticsAPI, $, userovoCommon */
(function() {
    window.userovoAnalyticsAPI = window.userovoAnalyticsAPI || {};

    userovoAnalyticsAPI.data = {};
    userovoAnalyticsAPI.currentAPP = "";
    userovoAnalyticsAPI.currentPeriod = "";
    userovoAnalyticsAPI.initialize = function(metrics, forceReload) {
        //reload only if forced/ App changed or priod changed
        var _period = userovoCommon.getPeriodForAjax();
        if (forceReload || userovoAnalyticsAPI.currentAPP === "" || userovoAnalyticsAPI.currentAPP !== userovoCommon.ACTIVE_APP_ID || userovoAnalyticsAPI.currentPeriod === "" || userovoAnalyticsAPI.currentPeriod !== _period) {
            var curApp = userovoCommon.ACTIVE_APP_ID;
            return $.ajax({
                type: "GET",
                url: userovoCommon.API_PARTS.data.r + "/analytics/tops",
                data: {
                    "app_id": userovoCommon.ACTIVE_APP_ID,
                    "metrics": JSON.stringify(metrics),
                    "period": _period
                },
                dataType: "json",
                success: function(json) {
                    userovoAnalyticsAPI.data = json;
                    userovoAnalyticsAPI.currentPeriod = _period;
                    userovoAnalyticsAPI.currentAPP = curApp;
                }
            });
        }
        else {
            return;
        }
    };

    userovoAnalyticsAPI.getTop = function(metric) {
        return userovoAnalyticsAPI.data && userovoAnalyticsAPI.data[metric];
    };
}());
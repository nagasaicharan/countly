/*global jQuery, userovoCommon, userovoGlobal*/

(function(userovoDataPoints, $) {
    //Private Properties
    var _dataPointsObj = {},
        _periods = [],
        _todPunchCardData = [],
        _selectedPeriod = "",
        _top = [];

    //Public Methods
    userovoDataPoints.initialize = function(options) {
        return $.when(
            $.ajax({
                type: "GET",
                url: userovoCommon.API_PARTS.data.r + "/server-stats/data-points",
                data: {
                    "period": userovoCommon.getPeriodAsDateStrings(),
                    "selected_app": options.app_id || "",
                },
                dataType: "json",
                success: function(json) {
                    userovoDataPoints.reset();
                    _dataPointsObj = json;
                }
            })
        ).then(function() {
            return true;
        });
    };

    userovoDataPoints.punchCard = function(options) {
        var data = {};
        data.period = userovoCommon.getPeriodAsDateStrings();

        if (options.app_id) {
            data.selected_app = options.app_id;
        }
        return $.when(
            $.ajax({
                type: "GET",
                url: userovoCommon.API_PARTS.data.r + "/server-stats/punch-card",
                dataType: "json",
                data: data,
                success: function(json) {
                    _todPunchCardData = json;
                }
            })
        ).then(function() {
            return true;
        });
    };

    userovoDataPoints.calculateTop = function(/*options*/) {
        var data = {};
        data.period = userovoCommon.getPeriodAsDateStrings();
        return $.when(
            $.ajax({
                type: "GET",
                url: userovoCommon.API_PARTS.data.r + "/server-stats/top",
                dataType: "json",
                //data: data,
                success: function(json) {
                    _top = json;
                }
            })
        ).then(function() {
            return true;
        });
    };

    userovoDataPoints.getPunchCardData = function() {
        return _todPunchCardData;
    };

    userovoDataPoints.getTop = function() {
        _top = _top || [];
        for (var z = 0; z < _top.length; z++) {
            _top[z].value = userovoCommon.formatNumber(_top[z].v || 0);
            _top[z].name = getAppName(_top[z].a);
        }
        return _top;
    };

    userovoDataPoints.refresh = function() {
        return true;
    };

    userovoDataPoints.reset = function() {
        _dataPointsObj = {};
        _periods = [];
        _selectedPeriod = "";
    };

    userovoDataPoints.getTableData = function() {
        var tableData = [];

        for (var app in _dataPointsObj) {
            var periodData = _dataPointsObj[app];

            var approx = false;
            var total = ((periodData.sessions || 0) + (periodData.events || 0) + (periodData.push || 0));
            if (app !== "all-apps" && app !== "natural-dp" && app !== "[CLY]_consolidated" && total < periodData.dp) {
                //var subtotal = (periodData.sessions + periodData.events) || 1;
                periodData.sessions = null;
                periodData.events = null;
                approx = true;
            }
            var appId = app;
            if (appId === "all-apps" || appId === "natural-dp") {
                appId = null;
            }
            var brokendownEvents = {
                "crashes": periodData.crash,
                "views": periodData.views,
                "actions": periodData.actions,
                "nps": periodData.nps,
                "surveys": periodData.surveys,
                "ratings": periodData.ratings,
                "apm": periodData.apm,
                "push": periodData.push,
                "ps": periodData.ps,
                "cs": periodData.cs,
                "custom": periodData.custom,
                llm: periodData.llm,
                aclk: periodData.aclk,
            };
            let sortable = [];
            for (var event in brokendownEvents) {
                sortable.push([event, brokendownEvents[event]]);
            }

            sortable.sort(function(a, b) {
                return b[1] - a[1];
            });

            tableData.push({
                "appName": getAppName(app),
                "appId": appId,
                "sessions": periodData.sessions,
                "data-points": periodData.dp,
                "change": periodData.change,
                "approximated": approx,
                "events": periodData.events,
                "events_breakdown": {
                    "crashes": periodData.crash,
                    "views": periodData.views,
                    "actions": periodData.actions,
                    "nps": periodData.nps,
                    "surveys": periodData.surveys,
                    "ratings": periodData.ratings,
                    "apm": periodData.apm,
                    "push": periodData.push,
                    "ps": periodData.ps,
                    "cs": periodData.cs,
                    "custom": periodData.custom,
                    llm: periodData.llm,
                    aclk: periodData.aclk,
                },

                "sorted_breakdown": sortable,
            });
        }

        return tableData;
    };

    userovoDataPoints.getPeriods = function() {
        for (var i = 0; i < _periods.length; i++) {
            _periods[i].selected = (_periods[i].period === _selectedPeriod);
        }

        return _periods;
    };

    userovoDataPoints.setPeriod = function(period) {
        _selectedPeriod = period;
    };

    /**
    * Returns a human readable name given application id.
    * @param {string} appId - Application Id
    * @returns {string} Returns a readable name
    **/
    function getAppName(appId) {
        if (appId === "all-apps") {
            return "(" + (jQuery.i18n.map["server-stats.all-datapoints"] || "All Datapoints") + ")";
        }
        else if (appId === "[CLY]_consolidated") {
            return "(" + (jQuery.i18n.map["server-stats.consolidated-datapoints"] || "Consolidated Datapoints") + ")";
        }
        else if (appId === "natural-dp") {
            return "(" + (jQuery.i18n.map["server-stats.natural-datapoints"] || "Natural Datapoints") + ")";
        }
        else if (userovoGlobal.apps[appId]) {
            return userovoGlobal.apps[appId].name;
        }
        else {
            return "App name not available (" + appId + ")";
        }
    }

})(window.userovoDataPoints = window.userovoDataPoints || {}, jQuery);

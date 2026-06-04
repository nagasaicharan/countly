/*global
    userovoCommon,
    userovoGlobal,
    userovoAuth,
    jQuery,
    CV,
    UserovoHelpers,
    userovoVue,
    app,
 */
(function(userovoReporting, $) {
    var FEATURE_NAME = "reports";
    //Private Properties
    var _data = {};
    var _metrics = [
        {name: jQuery.i18n.map["reports.analytics"], value: "analytics"},
        {name: jQuery.i18n.map["reports.events"], value: "events"},
        {name: jQuery.i18n.map["reports.revenue"], value: "revenue"},
        {name: jQuery.i18n.map["reports.crash"], value: "crash"},
    ];

    //Public Methods
    userovoReporting.initialize = function() {
        return $.ajax({
            type: "GET",
            url: userovoCommon.API_PARTS.data.r + "/reports/all",
            data: {
                "app_id": userovoCommon.ACTIVE_APP_ID
            },
            success: function(json) {
                if (json.length > 0) {
                    for (var i = 0; i < json.length; i++) {
                        json[i].title = json[i].title ? json[i].title : '';
                        json[i].report_type = json[i].report_type || "core";
                        json[i].enabled = json[i].enabled + '' === 'false' ? false : true;
                        json[i].pluginEnabled = json[i].report_type === "core" ? true : userovoGlobal.plugins.indexOf(json[i].report_type) > -1;


                    }
                }
                _data = json;
            }
        });
    };

    userovoReporting.getData = function() {
        return _data;
    };

    userovoReporting.create = function(args) {
        return $.ajax({
            type: "GET",
            url: userovoCommon.API_PARTS.data.w + "/reports/create",
            data: {
                args: JSON.stringify(args),
            }
        });
    };

    userovoReporting.update = function(args) {
        return $.ajax({
            type: "GET",
            url: userovoCommon.API_PARTS.data.w + "/reports/update",
            data: {
                args: JSON.stringify(args),
            }
        });
    };

    userovoReporting.del = function(id) {
        return $.ajax({
            type: "GET",
            url: userovoCommon.API_PARTS.data.w + "/reports/delete",
            data: {
                args: JSON.stringify({
                    "_id": id
                }),
            }
        });
    };

    userovoReporting.send = function(id) {
        return $.ajax({
            type: "GET",
            url: userovoCommon.API_PARTS.data.w + "/reports/send",
            data: {
                args: JSON.stringify({
                    "_id": id
                }),
                "app_id": userovoCommon.ACTIVE_APP_ID,
            }
        });
    };


    userovoReporting.getReport = function(id) {
        for (var i = 0; i < _data.length; i++) {
            if (_data[i]._id === id) {
                return _data[i];
            }
        }
        return null;
    };

    userovoReporting.addMetric = function(m) {
        var existed = _metrics.filter(function(item) {
            return item.value === m.value;
        });
        if (existed.length === 0) {
            _metrics.push(m);
        }
    };

    userovoReporting.getMetrics = function() {
        return _metrics;
    };



    userovoReporting.getDayName = function(day) {
        switch (day) {
        case 1:
            return jQuery.i18n.map["reports.monday"];
        case 2:
            return jQuery.i18n.map["reports.tuesday"];
        case 3:
            return jQuery.i18n.map["reports.wednesday"];
        case 4:
            return jQuery.i18n.map["reports.thursday"];
        case 5:
            return jQuery.i18n.map["reports.friday"];
        case 6:
            return jQuery.i18n.map["reports.saturday"];
        case 7:
            return jQuery.i18n.map["reports.sunday"];
        default:
            return "";
        }
    };

    userovoReporting.getVuexModule = function() {
        var getEmptyState = function() {
            return {
                tableData: [],
            };
        };

        var getters = {
            tableData: function(state) {
                return state.tableData;
            },
        };

        var mutations = {
            setTableData: function(state, list) {
                state.tableData = list;
            },
        };

        var actions = {
            initialize: function(context) {
                context.dispatch("refresh");
            },
            refresh: function(context) {
                context.dispatch("userovoReports/table/fetchAll", null, {root: true});
            },
            deleteReport: function(context, report) {
                return CV.$.ajax({
                    type: "GET",
                    url: userovoCommon.API_PARTS.data.w + "/reports/delete",
                    data: {
                        args: JSON.stringify({
                            "_id": report._id
                        }),
                        app_id: userovoCommon.ACTIVE_APP_ID
                    },
                    dataType: "json",
                    success: function() {
                        context.dispatch("userovoReports/table/fetchAll", null, {root: true});
                    },
                });
            },
            saveReport: function(context, args) {
                delete args._canUpdate;
                delete args._canDelete;
                return CV.$.ajax({
                    type: "GET",
                    url: userovoCommon.API_PARTS.data.w + "/reports/" + (args._id ? "update" : "create"),
                    data: {
                        args: JSON.stringify(args),
                        app_id: userovoCommon.ACTIVE_APP_ID
                    },
                    dataType: "json",
                    success: function() {
                        UserovoHelpers.notify({message: jQuery.i18n.map['reports.save-report-success']});
                        context.dispatch("userovoReports/table/fetchAll", null, {root: true});
                    }
                });
            },
        };

        var tableResource = userovoVue.vuex.Module("table", {
            state: function() {
                return {
                    all: [],
                    initialized: false,
                };
            },
            getters: {
                all: function(state) {
                    return state.all;
                },
                getInitialized: function(state) {
                    return state.initialized;
                }
            },
            mutations: {
                setAll: function(state, val) {
                    state.all = val;
                },
                setInitialized: function(state, val) {
                    state.initialized = val;
                },
            },
            actions: {
                updateStatus: function(context, status) {
                    return CV.$.ajax({
                        type: "get",
                        url: userovoCommon.API_PARTS.data.w + "/reports/status",
                        data: {
                            preventGlobalAbort: true,
                            args: JSON.stringify(status),
                            "app_id": userovoCommon.ACTIVE_APP_ID,
                        },
                        dataType: "json",
                        success: function() {
                            UserovoHelpers.notify({message: jQuery.i18n.map['reports.save-report-status-success']});
                        }
                    });
                },
                fetchAll: function(context) {
                    context.commit("setInitialized", false);
                    return CV.$.ajax({
                        type: "GET",
                        url: userovoCommon.API_PARTS.data.r + "/reports/all",
                        data: {
                            preventGlobalAbort: true,
                            "app_id": userovoCommon.ACTIVE_APP_ID
                        },
                    }).then(function(data) {
                        if (data.length > 0) {
                            var cnts = app.manageAppsView.getTimeZones();
                            // ReportingView.zones = {};
                            var zNames = {};
                            var zoneNames = [];
                            for (var x in cnts) {
                                for (var j = 0; j < cnts[x].z.length; j++) {
                                    for (var k in cnts[x].z[j]) {
                                        zoneNames.push(k);
                                        // ReportingView.zones[k] = cnts[i].z[j][k];
                                        zNames[cnts[x].z[j][k]] = k;
                                    }
                                }
                            }

                            for (var i = 0; i < data.length; i++) {
                                data[i].title = data[i].title ? data[i].title : '';
                                data[i].report_type = data[i].report_type || "core";
                                data[i].enabled = data[i].enabled + '' === 'false' ? false : true;
                                data[i].pluginEnabled = data[i].report_type === "core" ? true : userovoGlobal.plugins.indexOf(data[i].report_type) > -1;
                                data[i].appNames = UserovoHelpers.appIdsToNames(data[i].apps || []).split(", ");
                                data[i].dayname = userovoReporting.getDayName(data[i].day);
                                data[i].zoneName = zNames[data[i].timezone] || "(GMT+00:00) GMT (no daylight saving)";

                                zoneNames.sort(function(a, b) {
                                    a = parseFloat(a.split(")")[0].replace(":", ".").substring(4));
                                    b = parseFloat(b.split(")")[0].replace(":", ".").substring(4));
                                    if (a < b) {
                                        return -1;
                                    }
                                    if (a > b) {
                                        return 1;
                                    }
                                    return 0;
                                });

                                var ret = "";

                                if (data[i].report_type === "core") {
                                    for (var rowProp in data[i].metrics) {
                                        ret += jQuery.i18n.map["reports." + rowProp] + ", ";
                                    }

                                    ret = ret.substring(0, ret.length - 2);

                                    ret += " for " + data[i].appNames.join(", ");

                                    data[i]._canUpdate = true;
                                    data[i]._canDelete = true;
                                    for (var aIdx = 0; aIdx < data[i].apps.length; aIdx++) {
                                        if (!userovoAuth.validateUpdate(FEATURE_NAME, userovoGlobal.member, data[i].apps[aIdx])) {
                                            data[i]._canUpdate = false;
                                        }
                                        if (!userovoAuth.validateDelete(FEATURE_NAME, userovoGlobal.member, data[i].apps[aIdx])) {
                                            data[i]._canDelete = false;
                                        }
                                    }
                                }
                                else if (!data[i].pluginEnabled) {
                                    ret = jQuery.i18n.prop("reports.enable-plugin", data[i].report_type);
                                }
                                else if (!data[i].isValid) {
                                    ret = jQuery.i18n.prop("reports.not-valid");
                                }

                                if (data[i].pluginEnabled && data[i].report_type === "dashboards") {
                                    var dashboardId = data[i].dashboards;
                                    var dashboard = {};
                                    var dashboardsList = context.rootGetters["userovoDashboards/all"];
                                    for (var idx = 0; idx < dashboardsList.length; idx++) {
                                        if (dashboardId === dashboardsList[idx]._id) {
                                            dashboard = dashboardsList[idx];
                                        }
                                    }
                                    ret = "Dashboard " + (dashboard.name || "");
                                    data[i]._canUpdate = userovoAuth.validateUpdate(FEATURE_NAME, userovoGlobal.member, userovoCommon.ACTIVE_APP_ID);
                                    data[i]._canDelete = userovoAuth.validateDelete(FEATURE_NAME, userovoGlobal.member, userovoCommon.ACTIVE_APP_ID);
                                }
                                data[i].dataColumn = ret;

                                var timeColumn = jQuery.i18n.map["reports.at"] + " "
                                     + (data[i].hour < 10 ? "0" + data[i].hour : data[i].hour)
                                     + ":" + (data[i].minute < 10 ? "0" + data[i].minute : data[i].minute)
                                     + ", " + data[i].zoneName;

                                if (data[i].frequency === "weekly") {
                                    timeColumn += ", " + jQuery.i18n.map["reports.on"] + " " + data[i].dayname;
                                }
                                if (data[i].frequency === "monthly") {
                                    timeColumn += ", " + jQuery.i18n.map["reports.every-month"];
                                }
                                data[i].timeColumn = timeColumn;

                                data[i].createdByMe = true;
                                if (userovoGlobal.member.global_admin === true || data[i].user === userovoGlobal.member._id) {
                                    data[i].createdByMe = false;
                                }

                            }
                        }
                        context.commit("setInitialized", true);
                        context.commit("setAll", data);
                    });
                },
            }
        });
        return userovoVue.vuex.Module("userovoReports", {
            resetFn: getEmptyState,
            getters: getters,
            actions: actions,
            mutations: mutations,
            submodules: [tableResource]
        });
    };
    userovoReporting.defaultDrawerConfigValue = function() {
        return {
            _id: null,
            title: '',
            report_type: 'core',
            apps: [],
            emails: [],
            metrics: {},
            metricsArray: [],
            frequency: null,
            timezone: null,
            day: null,
            hour: null,
            minute: 0,
            dashboards: null,
            date_range: null,
        };
    };
}(window.userovoReporting = window.userovoReporting || {}, jQuery));

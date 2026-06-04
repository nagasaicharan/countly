/*global
    UserovoHelpers,
    userovoCommon,
    UserovoHelpers,
    userovoGlobal,
    userovoEvent,
    userovoReporting,
    jQuery,
    userovoVue,
    app,
    CV,
    $,
 */
(function() {
    var FEATURE_NAME = "reports";

    var TableView = userovoVue.views.BaseView.extend({
        mixins: [
            userovoVue.mixins.auth(FEATURE_NAME)
        ],
        template: '#reports-table',
        computed: {
            tableRows: function() {
                var rows = this.$store.getters["userovoReports/table/all"];
                return rows;
            },
            initialized: function() {
                var result = this.$store.getters["userovoReports/table/getInitialized"];
                return result;
            },
            rawTableRows: function() {
                var rows = this.$store.getters["userovoReports/table/all"];
                return rows;
            }
        },
        data: function() {
            return {
                localTableTrackedFields: ['enabled'],
                isAdmin: userovoGlobal.member.global_admin,
                deleteElement: null,
            };
        },
        props: {
            callCreateReportDrawer: {type: Function, default: function() {}},
        },
        methods: {
            createReport: function() {
                this.callCreateReportDrawer();
            },
            handleReportEditCommand: function(command, scope) {
                switch (command) {
                case "edit-comment":
                    var data = Object.assign({}, scope.row);
                    if (data.title) {
                        data.title = userovoCommon.unescapeHtml(data.title);
                    }
                    delete data.operation;
                    delete data.triggerEffectColumn;
                    delete data.nameDescColumn;
                    this.$parent.$parent.openDrawer("home", data);
                    break;
                case "delete-comment":
                    var self = this;
                    this.deleteElement = scope.row;
                    var deleteMessage = CV.i18n("reports.confirm", "<b>" + this.deleteElement.title + "</b>");
                    UserovoHelpers.confirm(deleteMessage, "red", function(result) {
                        if (!result) {
                            return true;
                        }
                        self.$store.dispatch("userovoReports/deleteReport", self.deleteElement);
                    });
                    break;
                case "send-comment":
                    var overlay = $("#overlay").clone();
                    overlay.show();
                    $.when(userovoReporting.send(scope.row._id)).always(function(sendResult) {
                        overlay.hide();
                        if (sendResult && sendResult.result === "Success") {
                            UserovoHelpers.notify({
                                message: jQuery.i18n.map["reports.sent"],
                            });
                        }
                        else {
                            if (sendResult && sendResult.result) {
                                UserovoHelpers.notify({
                                    message: sendResult.result,
                                    type: "error",
                                });
                            }
                            else {
                                UserovoHelpers.notify({
                                    message: sendResult && sendResult.result || jQuery.i18n.map["reports.comment-error"],
                                    type: "warning",
                                });
                            }
                        }
                    });
                    break;
                case "preview-comment":
                    document.forms.previewemailform.action = '/i/reports/preview?args=' + JSON.stringify({_id: scope.row._id}) + "&app_id=" + userovoCommon.ACTIVE_APP_ID;
                    document.forms.previewemailform.querySelectorAll('input[type=hidden]')[0].value = userovoGlobal.auth_token;
                    document.forms.previewemailform.submit();
                    break;
                default:
                    return;
                }
            },
            updateStatus: function(scope) {
                var diff = scope.diff;
                var status = {};
                diff.forEach(function(item) {
                    status[item.key] = item.newValue;
                });
                var self = this;
                this.$store.dispatch("userovoReports/table/updateStatus", status).then(function() {
                    return self.$store.dispatch("userovoReports/table/fetchAll");
                });
            },
            refresh: function() {
            // this.$store.dispatch("userovoReports/table/fetchAll");
            },
        }
    });



    var ReportsDrawer = userovoVue.views.BaseView.extend({
        template: '#reports-drawer',
        mixins: [
            userovoVue.container.dataMixin({
                "externalDataTypeOptions": "/reports/data-type",
            }),
        ],
        components: {
        },
        data: function() {
            var appsSelectorOption = [];
            for (var id in userovoGlobal.apps) {
                appsSelectorOption.push({label: userovoGlobal.apps[id].name, value: id});
            }

            // const reportTypeOptions = [
            //     {label: jQuery.i18n.map["reports.core"], value: 'core'},
            // ];
            // if (userovoGlobal.plugins.indexOf("dashboards")  > -1) {
            //     reportTypeOptions.push({label: jQuery.i18n.map["dashboards.report"], value: 'dashboards'});
            // }

            var metricOptions = [
                {label: jQuery.i18n.map["reports.analytics"], value: "analytics"},
                {label: jQuery.i18n.map["reports.events"], value: "events"},
                {label: jQuery.i18n.map["reports.revenue"], value: "revenue"},
                {label: jQuery.i18n.map["reports.crash"], value: "crash"},
            ];

            if (userovoGlobal.plugins.indexOf("star-rating") > -1) {
                metricOptions.push({label: jQuery.i18n.map["reports.star-rating"], value: "star-rating"});
            }

            if (userovoGlobal.plugins.indexOf("performance-monitoring") > -1) {
                metricOptions.push({label: jQuery.i18n.map["sidebar.performance-monitoring"], value: "performance"});
            }

            var frequencyOptions = [
                {label: jQuery.i18n.map["reports.daily"], value: "daily", description: jQuery.i18n.map["reports.daily-desc"]},
                {label: jQuery.i18n.map["reports.weekly"], value: "weekly", description: jQuery.i18n.map["reports.weekly-desc"]},
                {label: jQuery.i18n.map["reports.monthly"], value: "monthly", description: jQuery.i18n.map["reports.monthly-desc"]},
            ];
            var dayOfWeekOptions = [
                {label: jQuery.i18n.map["reports.monday"], value: 1},
                {label: jQuery.i18n.map["reports.tuesday"], value: 2},
                {label: jQuery.i18n.map["reports.wednesday"], value: 3},
                {label: jQuery.i18n.map["reports.thursday"], value: 4},
                {label: jQuery.i18n.map["reports.friday"], value: 5},
                {label: jQuery.i18n.map["reports.saturday"], value: 6},
                {label: jQuery.i18n.map["reports.sunday"], value: 7},

            ];
            var zones = [];
            for (var country in userovoGlobal.timezones) {
                /* eslint-disable no-loop-func */
                userovoGlobal.timezones[country].z.forEach(function(item) {
                    for (var zone in item) {
                        zones.push({value: item[zone], label: userovoGlobal.timezones[country].n + ' ' + zone});
                    }
                });
                /* eslint-enable no-loop-func */
            }
            var timeListOptions = [];
            for (var i = 0; i < 24; i++) {
                var v = (i > 9 ? i : "0" + i) + ":00";
                timeListOptions.push({ value: i, label: v});
            }

            return {
                title: "",
                saveButtonLabel: "",
                appsSelectorOption: appsSelectorOption,
                metricOptions: metricOptions,
                eventOptions: [],
                frequencyOptions: frequencyOptions,
                dayOfWeekOptions: dayOfWeekOptions,
                timeListOptions: timeListOptions,
                timezoneOptions: zones,
                // emailOptions: [{value: userovoGlobal.member.email, label: userovoGlobal.member.email}],
                showApps: true,
                showMetrics: true,
                showDashboards: false,
                reportDateRangesOptions: [],
                metricsArray: [],
            };
        },
        computed: {
            reportTypeOptions: function() {
                var options = [
                    {label: jQuery.i18n.map["reports.core"], value: 'core'},
                ];
                if (this.externalDataTypeOptions) {
                    options = options.concat(this.externalDataTypeOptions);
                }
                return options;
            },
            dashboardsOptions: function() {
                var dashboardsList = this.$store.getters["userovoDashboards/all"];
                var dashboardsOptions = [];
                for (var i = 0; i < dashboardsList.length; i++) {
                    dashboardsOptions.push({ value: dashboardsList[i]._id, label: dashboardsList[i].name });
                }
                userovoVue.container.registerData("/reports/dashboards-option", dashboardsOptions);
                return dashboardsOptions;
            },
        },
        watch: {
        },
        props: {
            controls: {
                type: Object
            }
        },
        methods: {
            reportTypeChange: function(type) {
                if (type === 'dashboards') {
                    this.showApps = false;
                    this.showMetrics = false;
                    this.showDashboards = true;
                    this.metricsArray = [];
                }
                else {
                    this.showApps = true;
                    this.showMetrics = true;
                    this.showDashboards = false;
                }
            },
            reportFrequencyChange: function(reportFrequency) {
                var dashboardRangesDict = this.$store.getters["userovoDashboards/reportDateRangeDict"];
                var reportDateRanges = dashboardRangesDict[reportFrequency] || [];
                this.reportDateRangesOptions = reportDateRanges.map(function(r) {
                    return {value: r.value, label: r.name};
                });
            },
            emailInputFilter: function(val) {
                var REGEX_EMAIL = '([a-z0-9!#$%&\'*+/=?^_`{|}~-]+(?:\\.[a-z0-9!#$%&\'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?)';
                var regex = new RegExp('^' + REGEX_EMAIL + '$', 'i');
                var match = val.match(regex);
                if (match) {
                    this.emailOptions = [{value: val, label: val}];
                }
                else {
                    this.emailOptions = [];
                }
            },
            appsChange: function(apps) {
                var self = this;
                userovoEvent.getEventsForApps(apps, function(eventData) {
                    var eventOptions = eventData.map(function(e) {
                        return {value: e.value, label: e.name};
                    });
                    self.eventOptions = eventOptions;
                });
                this.$children[0].editedObject.selectedEvents = [];
            },
            onSubmit: function(doc) {
                doc.metrics = {};
                this.metricsArray.forEach(function(m) {
                    doc.metrics[m] = true;
                });
                delete doc.hover;
                delete doc.user;
                this.$store.dispatch("userovoReports/saveReport", doc);
            },
            onClose: function($event) {
                this.$emit("close", $event);
            },
            onCopy: function(newState) {
                var self = this;
                this.metricsArray = [];
                this.reportTypeChange(newState.report_type);
                if (newState._id !== null) {
                    this.reportFrequencyChange(newState.frequency);

                    this.title = jQuery.i18n.map["reports.edit_report_title"];
                    this.saveButtonLabel = jQuery.i18n.map["reports.Save_Changes"];
                    for (var k in newState.metrics) {
                        this.metricsArray.push(k);
                    }
                    userovoEvent.getEventsForApps(newState.apps, function(eventData) {
                        var eventOptions = eventData.map(function(e) {
                            return {value: e.value, label: e.name};
                        });
                        self.eventOptions = eventOptions;
                    });
                    return;
                }
                this.title = jQuery.i18n.map["reports.create_new_report_title"];
                this.saveButtonLabel = jQuery.i18n.map["reports.Create_New_Report"];
            },
        },
        mounted: function() {
            if (reportsView._createDashboard) {
                this.reportTypeChange('dashboards');
            }
        }
    });

    var ReportsHomeViewComponent = userovoVue.views.BaseView.extend({
        template: "#reports-home",
        mixins: [
            userovoVue.mixins.hasDrawers("home"),
            userovoVue.mixins.auth(FEATURE_NAME),
        ],
        components: {
            "table-view": TableView,
            "drawer": ReportsDrawer,
        },
        data: function() {
            return {};
        },
        beforeCreate: function() {
            this.$store.dispatch("userovoReports/initialize");
        },
        methods: {
            createReport: function() {
                this.openDrawer("home", userovoReporting.defaultDrawerConfigValue());
            },
        },
        mounted: function() {
            if (reportsView._createDashboard) {
                var defaultData = userovoReporting.defaultDrawerConfigValue();
                var data = Object.assign({}, defaultData);
                if (data.title) {
                    data.title = userovoCommon.unescapeHtml(data.title);
                }
                data.report_type = "dashboards";
                data.dashboards = reportsView._createDashboard;
                this.openDrawer("home", data);
                reportsView._createDashboard = null;
            }
        },
    });

    var reportsView = new userovoVue.views.BackboneWrapper({

        component: ReportsHomeViewComponent,
        vuex: [{
            clyModel: userovoReporting
        }],
        templates: [
            "/reports/templates/vue-main.html",
        ],
    });
    reportsView.featureName = FEATURE_NAME;

    app.route('/manage/reports', 'reports', function() {
        this.renderWhenReady(reportsView);
    });
    app.route('/manage/reports/create/dashboard/:dashboardID', 'reports', function(dashboardID) {
        reportsView._createDashboard = dashboardID;
        this.renderWhenReady(reportsView);
    });

    app.addMenu("management", {code: "reports", permission: FEATURE_NAME, url: "#/manage/reports", text: "reports.title", priority: 90});
    if (app.configurationsView) {
        app.configurationsView.registerLabel("reports", "reports.title");
        app.configurationsView.registerLabel(
            "reports.secretKey",
            "reports.secretKey"
        );
    }

    if (userovoGlobal.plugins.indexOf("dashboards") > -1) {
        userovoVue.container.registerData("/reports/data-type", {label: jQuery.i18n.map["dashboards.report"], value: 'dashboards'});
    }


    app.addReportsCallbacks = function(plugin, options) {
        if (!this.reportCallbacks) {
            this.reportCallbacks = {};
        }

        this.reportCallbacks[plugin] = options;
    };

    app.getReportsCallbacks = function() {
        return this.reportCallbacks;
    };
})();

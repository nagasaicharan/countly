/*global CV, app, userovoVue, userovoConsentManager, userovoCommon, userovoConsentManager, UserovoHelpers, userovoGlobal, userovoAuth */
(function() {
    var FEATURE_NAME = "compliance_hub";
    var UserView = userovoVue.views.create({
        template: CV.T("/compliance-hub/templates/user.html"),
        mixins: [userovoVue.mixins.auth(FEATURE_NAME), userovoVue.mixins.i18n],
        data: function() {
            return {
                userTableDataSource: userovoVue.vuex.getServerDataSource(this.$store, "userovoConsentManager", "userDataResource"),
            };
        },
        beforeCreate: function() {
            this.$store.dispatch("userovoConsentManager/fetchUserDataResource");
        },
        methods: {
            deleteUserData: function(uid) {
                var self = this;
                UserovoHelpers.confirm(this.i18n("app-users.delete-userdata-confirm"), "popStyleGreen", function(result) {
                    if (!result) {
                        return true;
                    }
                    userovoConsentManager.service.deleteUserdata(JSON.stringify({ uid: uid }), function(error) {
                        if (error) {
                            UserovoHelpers.alert(error, "red");
                        }
                        else {
                            UserovoHelpers.notify({ type: "success", title: self.i18n("common.success"), message: self.i18n("app-users.userdata-deleted") });
                            self.$store.dispatch("userovoConsentManager/fetchUserDataResource");
                        }
                    });
                }, [self.i18n("app-users.no-dont-purge"), self.i18n("app-users.yes-purge-data")], { title: self.i18n("app-users.purge-confirm-title"), image: "purge-user-data" });
            },
            exportUserData: function(uid) {
                var self = this;
                userovoConsentManager.service.exportUser(JSON.stringify({ uid: uid }), function(error, export_id, task_id) {
                    self.$store.dispatch("userovoConsentManager/fetchUserDataResource");
                    if (error) {
                        UserovoHelpers.alert(error, "red");
                    }
                    else if (export_id) {
                        UserovoHelpers.notify({
                            type: "ok",
                            title: self.i18n("common.success"),
                            message: self.i18n("app-users.export-finished"),
                            info: self.i18n("consent.export-finished-click"),
                            sticky: false,
                            clearAll: true,
                            onClick: function() {
                                var win = window.open(userovoCommon.API_PARTS.data.r + "/app_users/download/" + export_id + "?auth_token=" + userovoGlobal.auth_token + "&app_id=" + userovoCommon.ACTIVE_APP_ID, '_blank');
                                win.focus();
                            }
                        });
                    }
                    else if (task_id) {
                        UserovoHelpers.notify({ type: "ok", title: self.i18n("common.success"), message: self.i18n("app-users.export-started"), sticky: false, clearAll: false });
                    }
                    else {
                        UserovoHelpers.alert(self.i18n("app-users.export-failed"), "red");
                    }
                });
            },
            deleteExport: function(uid) {
                var self = this;
                userovoConsentManager.service.deleteExport(uid, function(error) {
                    self.$store.dispatch("userovoConsentManager/fetchUserDataResource");
                    if (error) {
                        UserovoHelpers.alert(error, "red");
                    }
                    else {
                        UserovoHelpers.notify({ type: "ok", title: self.i18n("common.success"), message: self.i18n("app-users.export-deleted"), sticky: false, clearAll: true });
                    }
                });
            },
            downloadExportedData: function(uid) {
                var win = window.open(userovoCommon.API_PARTS.data.r + "/app_users/download/appUser_" + userovoCommon.ACTIVE_APP_ID + "_" + uid + "?auth_token=" + userovoGlobal.auth_token + "&app_id=" + userovoCommon.ACTIVE_APP_ID, '_blank');
                win.focus();
            },
            handleCommand: function(command, uid) {
                if (command === "deleteUserData") {
                    this.deleteUserData(uid);
                }
                else if (command === "exportUserData") {
                    this.exportUserData(uid);
                }
                else if (command === "deleteExport") {
                    this.deleteExport(uid);
                }
                else if (command === "downloadExportedData") {
                    this.downloadExportedData(uid);
                }
            }
        }
    });
    var ConsentView = userovoVue.views.create({
        template: CV.T("/compliance-hub/templates/consentHistory.html"),
        data: function() {
            return {
                consentHistoryTableSource: userovoVue.vuex.getServerDataSource(this.$store, "userovoConsentManager", "consentHistoryResource"),
                filter0: [
                    {
                        value: 'all',
                        label: this.i18n("common.all")
                    },
                    {
                        value: 'sessions',
                        label: this.i18n("compliance_hub.Sessions")
                    },
                    {
                        value: "events",
                        label: this.i18n('compliance_hub.Events')
                    },
                    {
                        value: 'views',
                        label: this.i18n('compliance_hub.Views')
                    },
                    {
                        value: 'scrolls',
                        label: this.i18n('compliance_hub.Scrolls')
                    },
                    {
                        value: 'clicks',
                        label: this.i18n('compliance_hub.Clicks')
                    },
                    {
                        value: 'forms',
                        label: this.i18n('compliance_hub.Forms')
                    },
                    {
                        value: 'crashes',
                        label: this.i18n("compliance_hub.Crashes")
                    },
                    {
                        value: 'push',
                        label: this.i18n('compliance_hub.Push')
                    },
                    {
                        value: 'attribution',
                        label: this.i18n('compliance_hub.Attribution')
                    },
                    {
                        value: 'users',
                        label: this.i18n('compliance_hub.Users')
                    },
                    {
                        value: 'star-rating',
                        label: this.i18n('compliance_hub.Star-rating')
                    }
                ],
                filter1: [
                    {
                        value: 'all',
                        label: this.i18n("common.all")
                    },
                    {
                        value: 'i',
                        label: this.i18n("consent.opt-i")
                    },
                    {
                        value: 'o',
                        label: this.i18n("consent.opt-o")
                    }
                ],
            };
        },
        beforeCreate: function() {
            this.$store.dispatch("userovoConsentManager/uid", this.$route.params.uid);
            this.$store.dispatch("userovoConsentManager/fetchConsentHistoryResource");
        },
        computed: {
            selectedfilterforConsent: {
                get: function() {
                    return this.$store.getters["userovoConsentManager/consentHistoryFilter"].type;
                },
                set: function(newValue) {
                    this.$store.commit("userovoConsentManager/setConsentHistoryFilter", {
                        key: 'type',
                        value: newValue,
                    });
                    this.initializeStoreData();
                }
            },
            selectedfilterforMetrics: {
                get: function() {
                    return this.$store.getters["userovoConsentManager/consentHistoryFilter"].change;
                },
                set: function(newValue) {
                    this.$store.commit("userovoConsentManager/setConsentHistoryFilter", {
                        key: 'change',
                        value: newValue,
                    });
                    this.initializeStoreData();
                }
            },
            consentHistoryLoading: function() {
                return this.$store.getters["userovoConsentManager/consentHistoryLoading"];
            }
        },
        methods: {
            dateChanged: function() {
                this.initializeStoreData();
            },
            initializeStoreData: function() {
                var newValue = this.selectedfilter0;
                if (this.selectedfilter0 === 'all') {
                    newValue = "";
                }
                var self = this;
                userovoConsentManager.initialize().then(function() {
                    var payload = {
                        "segment": newValue
                    };
                    self.$store.dispatch("userovoConsentManager/_bigNumberData", payload);
                    self.$store.dispatch("userovoConsentManager/_consentDP", payload);
                    self.$store.dispatch("userovoConsentManager/_exportDP", payload);
                    self.$store.dispatch("userovoConsentManager/_purgeDP");
                    self.$store.dispatch("userovoConsentManager/_ePData");
                    self.$store.dispatch("userovoConsentManager/fetchConsentHistoryResource");
                });
            },
            tableRowClickHandler: function(row) {
                // Only expand row if text inside of it are not highlighted
                if (window.getSelection().toString().length === 0) {
                    this.$refs.table.$refs.elTable.toggleRowExpansion(row);
                }
            }
        }

    });
    var ExportView = userovoVue.views.create({
        template: CV.T("/compliance-hub/templates/exportHistory.html"),
        data: function() {
            return {
                exportHistoryTableSource: userovoVue.vuex.getServerDataSource(this.$store, "userovoConsentManager", "exportHistoryDataResource"),
                filter0: [
                    {
                        value: 'all',
                        label: this.i18n("common.all")
                    },
                    {
                        value: 'export_app_user',
                        label: this.i18n("compliance_hub.Export-finished")
                    },
                    {
                        value: 'app_user_deleted',
                        label: this.i18n("compliance_hub.App-user-deleted")
                    },
                    {
                        value: 'export_app_user_deleted',
                        label: this.i18n("compliance_hub.Export-file-deleted")
                    }
                ],
                filter1: [
                    {
                        value: 'all',
                        label: this.i18n("common.all")
                    },
                    {
                        value: 'i',
                        label: this.i18n("consent.opt-i")
                    },
                    {
                        value: 'o',
                        label: this.i18n("consent.opt-o")
                    }
                ],
                selectedfilter1: 'all',
                selectedfilter0: 'all',
                selectedfilterforConsent: 'i',
            };
        },
        beforeCreate: function() {
            this.$store.dispatch("userovoConsentManager/fetchExportHistoryDataResource");
        },
        computed: {
            selectedfilterforMetrics: {
                get: function() {
                    return this.selectedfilter0;
                },
                set: function(newValue) {
                    this.selectedfilter0 = newValue;
                    this.initializeStoreData();
                }
            },
        },
        methods: {
            dateChanged: function() {
                this.initializeStoreData();
            },
            initializeStoreData: function() {
                var newValue = this.selectedfilter0;
                if (this.selectedfilter0 === 'all') {
                    newValue = "";
                }
                var self = this;
                userovoConsentManager.initialize().then(function() {
                    var payload = {
                        "segment": newValue
                    };
                    self.$store.dispatch("userovoConsentManager/_bigNumberData", payload);
                    self.$store.dispatch("userovoConsentManager/_consentDP", payload);
                    self.$store.dispatch("userovoConsentManager/_exportDP", payload);
                    self.$store.dispatch("userovoConsentManager/_purgeDP");
                    self.$store.dispatch("userovoConsentManager/_ePData");
                    self.$store.commit("userovoConsentManager/exportHistoryFilter", self.selectedfilter0);
                    self.$store.dispatch("userovoConsentManager/fetchExportHistoryDataResource");

                });
            },
        }

    });
    var MetricsView = userovoVue.views.create({
        template: CV.T("/compliance-hub/templates/metrics.html"),
        data: function() {
            return {
                consentDpChartloaded: false,
                exportDpChartloaded: false,
                purgeDpChartloaded: false,
                chartLoading: false,
                filter0: [
                    {
                        value: 'all',
                        label: this.i18n("common.all")
                    },
                    {
                        value: 'sessions',
                        label: this.i18n("compliance_hub.Sessions")
                    },
                    {
                        value: "events",
                        label: this.i18n('compliance_hub.Events')
                    },
                    {
                        value: 'views',
                        label: this.i18n('compliance_hub.Views')
                    },
                    {
                        value: 'scrolls',
                        label: this.i18n('compliance_hub.Scrolls')
                    },
                    {
                        value: 'clicks',
                        label: this.i18n('compliance_hub.Clicks')
                    },
                    {
                        value: 'forms',
                        label: this.i18n('compliance_hub.Forms')
                    },
                    {
                        value: 'crashes',
                        label: this.i18n("compliance_hub.Crashes")
                    },
                    {
                        value: 'push',
                        label: this.i18n('compliance_hub.Push')
                    },
                    {
                        value: 'attribution',
                        label: this.i18n('compliance_hub.Attribution')
                    },
                    {
                        value: 'users',
                        label: this.i18n('compliance_hub.Users')
                    },
                    {
                        value: 'star-rating',
                        label: this.i18n('compliance_hub.Star-rating')
                    }
                ],
                selectedfilter0: 'sessions',
            };

        },
        beforeCreate: function() {
            var self = this;
            var payload = {
                "segment": "sessions"
            };
            userovoConsentManager.initialize().then(function() {
                self.$store.dispatch("userovoConsentManager/_bigNumberData", payload);
                self.$store.dispatch("userovoConsentManager/_consentDP", payload);
                self.$store.dispatch("userovoConsentManager/_exportDP", payload);
                self.$store.dispatch("userovoConsentManager/_purgeDP");
                self.$store.dispatch("userovoConsentManager/_ePData");
            });
        },
        computed: {
            selectedfilterforMetrics: {
                get: function() {
                    return this.selectedfilter0;
                },
                set: function(newValue) {
                    this.selectedfilter0 = newValue;
                    this.initializeStoreData();
                    this.consentDpChartloaded = true;
                    this.purgeDpChartloaded = true;
                    this.exportDpChartloaded = true;
                }
            },
            consentDpChart: function() {
                this.consentDpChartloaded = true;
                var consentDp = this.$store.getters["userovoConsentManager/_consentDP"];
                var optinYAxisData = [];
                var optoutYAxisData = [];
                for (var key in consentDp.chartData) {
                    optinYAxisData.push(consentDp.chartData[key].i);
                    optoutYAxisData.push(consentDp.chartData[key].o);
                }
                if (optinYAxisData.length > 0) {
                    this.consentDpChartloaded = false;
                }
                else if (consentDp.chartData) {
                    this.consentDpChartloaded = false;
                }
                return {
                    series: [
                        {
                            name: "opt-in",
                            data: optinYAxisData,

                        },
                        {
                            name: "opt-out",
                            data: optoutYAxisData
                        }
                    ]
                };
            },
            consentDpChartlegend: function() {
                var _bigNumberData = this.$store.getters["userovoConsentManager/_bigNumberData"];
                var legendData = {
                    show: true,
                    type: "primary",
                    data: [{
                        name: "opt-in",
                        label: this.i18n("consent.opt-i"),
                        value: _bigNumberData && _bigNumberData.i ? this.formatNumber(_bigNumberData.i.total) : 0,
                        percentage: _bigNumberData && _bigNumberData.i ? _bigNumberData.i.change : 0,
                        trend: _bigNumberData && _bigNumberData.i ? _bigNumberData.i.trend === 'u' ? "up" : "down" : "-",
                    },
                    {

                        name: "opt-out",
                        label: this.i18n("consent.opt-o"),
                        value: _bigNumberData && _bigNumberData.o ? this.formatNumber(_bigNumberData.o.total) : 0,
                        percentage: _bigNumberData && _bigNumberData.o ? _bigNumberData.o.change : 0,
                        trend: _bigNumberData && _bigNumberData.o ? _bigNumberData.o.trend === 'u' ? "up" : "down" : "-",
                    }
                    ],
                };
                return legendData;
            },
            exportDpChart: function() {
                this.exportDpChartloaded = true;
                var exportDP = this.$store.getters["userovoConsentManager/_exportDP"];
                var presentYAxisData = [];
                var previousYAxisData = [];
                for (var key in exportDP.chartData) {
                    presentYAxisData.push(exportDP.chartData[key].e);
                    previousYAxisData.push(exportDP.chartData[key].pe);
                }
                if (presentYAxisData.length > 0) {
                    this.exportDpChartloaded = false;
                }
                else if (exportDP.chartData) {
                    this.exportDpChartloaded = false;
                }
                return {
                    series: [
                        {
                            name: "present",
                            data: presentYAxisData,

                        },
                        {
                            name: "Previous",
                            data: previousYAxisData
                        }
                    ]
                };
            },
            purgeDpChart: function() {
                this.purgeDpChartloaded = true;
                var purgeDp = this.$store.getters["userovoConsentManager/_purgeDP"];
                var purgeDpPresent = [];
                var purgeDpPrevious = [];
                for (var key in purgeDp.chartData) {
                    purgeDpPresent.push(purgeDp.chartData[key].p);
                    purgeDpPrevious.push(purgeDp.chartData[key].pp);
                }
                if (purgeDpPresent.length > 0) {
                    this.purgeDpChartloaded = false;
                }
                else if (purgeDp.chartData) {
                    this.purgeDpChartloaded = false;
                }
                var data = {
                    series: [
                        {
                            name: "present",
                            data: purgeDpPresent,

                        },
                        {
                            name: "Previous",
                            data: purgeDpPrevious,

                        },
                    ]
                };
                return data;
            },
            userDatalegend: function() {
                var data = this.$store.getters["userovoConsentManager/_ePData"];
                if (data.e) {
                    data.e.title = this.i18n("consent.userdata-exports");
                    data.p.title = this.i18n("consent.userdata-purges");
                    var legendData = {
                        name: data.e.title,
                        label: data.e.title,
                        value: data.e.total,
                        percentage: data.e.change,
                        trend: data.e.trend,
                        class: data.e.trend === 'u' ? 'cly-trend-up' : 'cly-trend-down'
                    };
                    return legendData;
                }
                return {};
            },
            purgeDatalegend: function() {
                var data = this.$store.getters["userovoConsentManager/_ePData"];
                if (data.e) {
                    data.e.title = this.i18n("consent.userdata-exports");
                    data.p.title = this.i18n("consent.userdata-purges");
                    var legendData = {
                        name: data.p.title,
                        label: data.p.title,
                        value: data.e.total,
                        percentage: data.p.change,
                        trend: data.p.trend,
                        class: data.p.trend === 'u' ? 'cly-trend-up' : 'cly-trend-down'
                    };
                    return legendData;
                }
                return {};

            }
        },
        methods: {
            dateChanged: function() {
                this.consentDpChartloaded = true;
                this.exportDpChartloaded = true;
                this.purgeDpChartloaded = true;
                this.initializeStoreData();
            },
            formatTableNumber: function(data) {
                if (Math.abs(data) >= 10000) {
                    return this.getShortNumber(data);
                }
                else {
                    return this.formatNumber(data);
                }
            },
            initializeStoreData: function() {
                this.chartLoading = false;
                var newValue = this.selectedfilter0;
                if (this.selectedfilter0 === 'all') {
                    newValue = "";
                }
                var self = this;
                userovoConsentManager.initialize().then(function() {
                    var payload = {
                        "segment": newValue
                    };
                    self.$store.dispatch("userovoConsentManager/_bigNumberData", payload);
                    self.$store.dispatch("userovoConsentManager/_consentDP", payload);
                    self.$store.dispatch("userovoConsentManager/_exportDP", payload);
                    self.$store.dispatch("userovoConsentManager/_purgeDP");
                    self.$store.dispatch("userovoConsentManager/_ePData");

                });
            },
        }
    });
    var ComplianceMainView = userovoVue.views.create({
        template: CV.T('/compliance-hub/templates/main.html'),
        data: function() {
            var tabs = [
                {
                    title: "Metrics",
                    name: "metrics",
                    component: MetricsView,
                    route: "#/" + userovoCommon.ACTIVE_APP_ID + "/manage/compliance/"
                },
                {
                    title: "Users",
                    name: "users",
                    component: UserView,
                    route: "#/" + userovoCommon.ACTIVE_APP_ID + "/manage/compliance/users"
                },
                {
                    title: "Consent History",
                    name: "history",
                    component: ConsentView,
                    route: "#/" + userovoCommon.ACTIVE_APP_ID + "/manage/compliance/history"
                }
            ];

            if (userovoAuth.validateGlobalAdmin()) {
                tabs.push({
                    title: "Export/Purge History",
                    name: "actionlogs",
                    component: ExportView,
                    route: "#/" + userovoCommon.ACTIVE_APP_ID + "/manage/compliance/actionlogs"
                });
            }
            return {
                appId: userovoCommon.ACTIVE_APP_ID,
                dynamicTab: (this.$route.params && this.$route.params.tab) || "",
                localTabs: tabs
            };
        },
        computed: {
            tabs: function() {
                var allTabs = this.localTabs;
                return allTabs;
            }
        }
    });

    userovoVue.container.registerTab("/users/tabs", {
        priority: 3,
        title: CV.i18n("consent.title"),
        name: 'Consent',
        pluginName: "compliance-hub",
        permission: "compliance_hub",
        component: userovoVue.components.create({
            template: CV.T("/compliance-hub/templates/userConsentHistory.html"),
            mixins: [userovoVue.mixins.i18n],
            data: function() {
                return {
                    userConsentHistoryTableSource: userovoVue.vuex.getServerDataSource(this.$store, "userovoConsentManager", "consentHistoryUserResource"),
                };
            },
            computed: {
                isLoading: function() {
                    return this.$store.getters["userovoConsentManager/isLoading"];
                }
            },
            beforeCreate: function() {
                var userDetails = this.$store.getters["userovoUsers/userDetailsResource/userDetails"];
                if (userDetails.uid) {
                    this.$store.dispatch("userovoConsentManager/uid", userDetails.uid);
                    this.$store.dispatch("userovoConsentManager/fetchConsentHistoryUserResource", userDetails);
                }
            }
        }),
        vuex: [{
            clyModel: userovoConsentManager
        }],
    });
    var getMainView = function() {
        var vuex = [{
            clyModel: userovoConsentManager
        }];

        return new userovoVue.views.BackboneWrapper({
            component: ComplianceMainView,
            vuex: vuex,
        });
    };
    app.route("/manage/compliance/", 'compliance', function() {
        var renderedView = getMainView();
        this.renderWhenReady(renderedView);
    });
    app.route("/manage/compliance/*tab", 'compliance-tab', function(tab) {
        var renderedView = getMainView();
        var params = {
            tab: tab
        };
        renderedView.params = params;
        this.renderWhenReady(renderedView);
    });
    app.route("/manage/compliance/*tab/*uid", 'compliance-tab-uid', function(tab, uid) {
        var renderedView = getMainView();
        var params = {
            tab: tab,
            uid: uid
        };
        renderedView.params = params;
        this.renderWhenReady(renderedView);
    });
    app.addSubMenu("management", {code: "compliance", permission: "compliance_hub", pluginName: "compliance-hub", url: "#/manage/compliance/", text: "compliance_hub.title", priority: 60});

})();

/* global userovoVue, userovoCompareApps, userovoCommon, CV, userovoCommon, app*/
(function() {
    var CompareAppsTable = userovoVue.views.create({
        template: CV.T("/compare/templates/compareAppsTable.html"),
        mixins: [userovoVue.mixins.i18n],
        updated: function() {
            this.$refs.compareApps.$refs.elTable.clearSelection();
            var self = this;
            this.$store.getters["userovoCompareApps/tableRows"]
                .map(function(row) {
                    if (row.checked) {
                        self.$refs.compareApps.$refs.elTable.toggleRowSelection(row, true);
                    }
                    else {
                        self.$refs.compareApps.$refs.elTable.toggleRowSelection(row, false);
                    }
                });
        },
        computed: {
            appsTableRows: function() {
                return this.$store.getters["userovoCompareApps/tableRows"];
            },
            isTableLoading: function() {
                return this.$store.getters["userovoCompareApps/isTableLoading"];
            }
        },
        methods: {
            handleCurrentChange: function(selection) {
                var selectedApps = [];
                selection.forEach(function(item) {
                    selectedApps.push(item.id);
                });
                this.$store.dispatch('userovoCompareApps/updateTableStateMap', selection);
                this.$store.dispatch('userovoCompareApps/fetchLineChartData', selectedApps);
                this.$store.dispatch('userovoCompareApps/fetchLegendData', selectedApps);
            },
            handleAllChange: function(selection) {
                var selectedApps = [];
                selection.forEach(function(item) {
                    selectedApps.push(item.id);
                });
                this.$store.dispatch('userovoCompareApps/updateTableStateMap', selection);
                this.$store.dispatch('userovoCompareApps/fetchLineChartData', selectedApps);
                this.$store.dispatch('userovoCompareApps/fetchLegendData', selectedApps);
            }
        },
    });
    var CompareApps = userovoVue.views.create({
        template: CV.T("/compare/templates/compareApps.html"),
        components: {
            "detail-tables": CompareAppsTable,
        },
        methods: {
            compareApps: function() {
                this.$store.dispatch('userovoCompareApps/setTableLoading', true);
                this.$store.dispatch('userovoCompareApps/setChartLoading', true);
                this.$store.dispatch('userovoCompareApps/setSelectedApps', this.value);
                this.$store.dispatch('userovoCompareApps/fetchCompareAppsData');
            },
            dateChanged: function() {
                this.$store.dispatch('userovoCompareApps/setTableLoading', true);
                this.$store.dispatch('userovoCompareApps/setChartLoading', true);
                this.$store.dispatch('userovoCompareApps/fetchCompareAppsData');
            }
        },
        computed: {
            allCompareAppsList: function() {
                return this.$store.getters["userovoCommon/getAllApps"];
            },
            lineChartData: function() {
                return this.$store.getters["userovoCompareApps/lineChartData"];
            },
            lineLegend: function() {
                return this.$store.getters["userovoCompareApps/lineLegend"];
            },
            selectedGraph: {
                get: function() {
                    var self = this;
                    if (self.selectedMetric === "totalSessions") {
                        return this.i18n("compare.apps.results.by.total.sessions");
                    }
                    else if (self.selectedMetric === "totalVisitors") {
                        return this.i18n("compare.apps.results.by.total.visitors");
                    }
                    else if (self.selectedMetric === "newVisitors") {
                        return this.i18n("compare.apps.results.by.new.visitors");
                    }
                    else if (self.selectedMetric === "timeSpent") {
                        return this.i18n("compare.apps.results.by.time.spent");
                    }
                    return this.i18n("compare.apps.results.by.avg.session.duration");
                },
                set: function(selectedItem) {
                    var self = this;
                    this.$store.dispatch('userovoCompareApps/setTableLoading', true);
                    this.$store.dispatch('userovoCompareApps/setChartLoading', true);
                    var selectedApps = this.$store.getters["userovoCompareApps/selectedApps"];
                    if (selectedItem === "totalSessions") {
                        self.selectedMetric = "totalSessions";
                        this.$store.dispatch('userovoCompareApps/setSelectedGraphMetric', "total-sessions");
                        this.$store.dispatch('userovoCompareApps/fetchLineChartData', selectedApps);
                    }
                    else if (selectedItem === "totalVisitors") {
                        self.selectedMetric = "totalVisitors";
                        this.$store.dispatch('userovoCompareApps/setSelectedGraphMetric', "total-users");
                        this.$store.dispatch('userovoCompareApps/fetchLineChartData', selectedApps);
                    }
                    else if (selectedItem === "newVisitors") {
                        self.selectedMetric = "newVisitors";
                        this.$store.dispatch('userovoCompareApps/setSelectedGraphMetric', "new-users");
                        this.$store.dispatch('userovoCompareApps/fetchLineChartData', selectedApps);
                    }
                    else if (selectedItem === "timeSpent") {
                        self.selectedMetric = "timeSpent";
                        this.$store.dispatch('userovoCompareApps/setSelectedGraphMetric', "total-time-spent");
                        this.$store.dispatch('userovoCompareApps/fetchLineChartData', selectedApps);
                    }
                    else {
                        self.selectedMetric = "avgSessionDuration";
                        this.$store.dispatch('userovoCompareApps/setSelectedGraphMetric', "time-spent");
                        this.$store.dispatch('userovoCompareApps/fetchLineChartData', selectedApps);
                    }
                }
            },
            isChartLoading: function() {
                return this.$store.getters["userovoCompareApps/isChartLoading"];
            }
        },
        data: function() {
            return {
                value: "",
                maxLimit: 20,
                placeholder: this.i18n("compare.apps.maximum.placeholder"),
                availableMetrics: [
                    { key: "totalSessions", label: this.i18n("compare.apps.results.by.total.sessions")},
                    { key: "totalVisitors", label: this.i18n("compare.apps.results.by.total.visitors")},
                    { key: "newVisitors", label: this.i18n("compare.apps.results.by.new.visitors")},
                    { key: "timeSpent", label: this.i18n("compare.apps.results.by.time.spent")},
                    { key: "avgSessionDuration", label: this.i18n("compare.apps.results.by.avg.session.duration")}
                ],
                selectedMetric: "totalSessions"
            };
        },
        beforeCreate: function() {
            this.$store.dispatch('userovoCompareApps/initializeTableStateMap');
        }

    });
    var getMainView = function() {
        return new userovoVue.views.BackboneWrapper({
            component: CompareApps,
            vuex: [{
                clyModel: userovoCompareApps
            }]
        });
    };
    app.route("/compare", "compare-apps", function() {
        var view = getMainView();
        view.params = {app_id: userovoCommon.ACTIVE_APP_ID};
        this.renderWhenReady(view);
    });

    userovoVue.container.registerData("/apps/compare", {
        enabled: {"default": true}
    });
})();
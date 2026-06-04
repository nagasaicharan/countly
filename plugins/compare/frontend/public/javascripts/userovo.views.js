/* global userovoVue, userovoCompareEvents, CV, userovoCommon*/
(function() {
    var FEATURE_NAME = "compare";
    var CompareEventsTable = userovoVue.views.create({
        template: CV.T("/compare/templates/compareEventsTable.html"),
        mixins: [userovoVue.mixins.i18n],
        data: function() {
            return {
                scoreTableExportSettings: {
                    title: "CompareEvents",
                    timeDependent: true,
                }
            };
        },
        updated: function() {
            this.$refs.compareEvents.$refs.elTable.clearSelection();
            var self = this;
            this.$store.getters["userovoCompareEvents/tableRows"]
                .map(function(row) {
                    if (row.checked) {
                        self.$refs.compareEvents.$refs.elTable.toggleRowSelection(row, true);
                    }
                    else {
                        self.$refs.compareEvents.$refs.elTable.toggleRowSelection(row, false);
                    }
                });
        },
        computed: {
            eventsTableRows: function() {
                return this.$store.getters["userovoCompareEvents/tableRows"];
            },
            groupData: function() {
                return this.$store.getters["userovoCompareEvents/groupData"];
            },
            isTableLoading: function() {
                return this.$store.getters["userovoCompareEvents/isTableLoading"];
            },
        },
        methods: {
            handleCurrentChange: function(selection) {
                var selectedEvents = [];
                selection.forEach(function(item) {
                    selectedEvents.push(item.id);
                });
                this.$store.dispatch('userovoCompareEvents/updateTableStateMap', selection);
                this.$store.dispatch('userovoCompareEvents/fetchLineChartData', selectedEvents);
                this.$store.dispatch('userovoCompareEvents/fetchLegendData', selectedEvents);
            },
            handleAllChange: function(selection) {
                var selectedEvents = [];
                selection.forEach(function(item) {
                    selectedEvents.push(item.id);
                });
                this.$store.dispatch('userovoCompareEvents/updateTableStateMap', selection);
                this.$store.dispatch('userovoCompareEvents/fetchLineChartData', selectedEvents);
                this.$store.dispatch('userovoCompareEvents/fetchLegendData', selectedEvents);
            },
            formatDuration: function(value) {
                return userovoCommon.formatSecond(value);
            }
        },
    });

    var CompareEvents = userovoVue.views.create({
        template: CV.T("/compare/templates/compare.html"),
        components: {
            "detail-tables": CompareEventsTable,
        },
        methods: {
            compareEvents: function() {
                this.$store.dispatch('userovoCompareEvents/setTableLoading', true);
                this.$store.dispatch('userovoCompareEvents/setChartLoading', true);
                this.$store.dispatch('userovoCompareEvents/fetchSelectedEvents', this.value);
                this.$store.dispatch('userovoCompareEvents/fetchCompareEventsData');
            },
            refresh: function() {
                var selectedEvents = this.$store.getters["userovoCompareEvents/selectedEvents"];
                if (selectedEvents.length > 0) {
                    this.$store.dispatch('userovoCompareEvents/fetchRefreshCompareEventsData');
                }
            },
            dateChanged: function() {
                this.$store.dispatch('userovoCompareEvents/setTableLoading', true);
                this.$store.dispatch('userovoCompareEvents/setChartLoading', true);
                this.$store.dispatch('userovoCompareEvents/fetchCompareEventsData', this.value);
            },
            formatChartValue: function(value) {
                if (["Duration", "AvgDuration"].includes(this.selectedMetric)) {
                    return userovoCommon.formatSecond(value);
                }
                return userovoCommon.getShortNumber(value);
            }
        },
        computed: {
            allEventsList: function() {
                return this.$store.getters["userovoCompareEvents/allEventsList"];
            },
            lineChartData: function() {
                return this.$store.getters["userovoCompareEvents/lineChartData"];
            },
            lineLegend: function() {
                return this.$store.getters["userovoCompareEvents/lineLegend"];
            },
            selectedGraph: {
                get: function() {
                    var self = this;
                    let metric = this.availableMetrics.find(function(item) {
                        return item.key === self.selectedMetric;
                    });
                    return metric.label || this.i18n("compare.events.results.by.count");
                },
                set: function(selectedItem) {
                    this.$store.dispatch('userovoCompareEvents/setTableLoading', true);
                    this.$store.dispatch('userovoCompareEvents/setChartLoading', true);
                    var selectedEvents = this.$store.getters["userovoCompareEvents/selectedEvents"];
                    let metric = this.availableMetrics.find(function(item) {
                        return item.key === selectedItem;
                    });
                    metric = metric || this.availableMetrics[0];

                    this.selectedMetric = metric.key;
                    this.$store.dispatch('userovoCompareEvents/fetchSelectedGraphMetric', metric.graphMetric);
                    this.$store.dispatch('userovoCompareEvents/fetchLineChartData', selectedEvents);
                }
            },
            isChartLoading: function() {
                return this.$store.getters["userovoCompareEvents/isChartLoading"];
            }
        },
        data: function() {
            return {
                value: "",
                maxLimit: 20,
                availableMetrics: [
                    { key: "Count", label: this.i18n("compare.events.results.by.count"), graphMetric: "c"},
                    { key: "Sum", label: this.i18n("compare.events.results.by.sum"), graphMetric: "s"},
                    { key: "Duration", label: this.i18n("compare.events.results.by.duration"), graphMetric: "dur"},
                    { key: "AvgDuration", label: this.i18n("compare.events.results.by.avg.duration"), graphMetric: "avgDur"}
                ],
                selectedMetric: "Count"
            };
        },
        beforeCreate: function() {
            this.$store.dispatch('userovoCompareEvents/fetchAllEventsData');
        }

    });

    userovoVue.container.registerTab("/analytics/events", {
        priority: 2,
        name: "compare",
        permission: FEATURE_NAME,
        title: "Compare Events",
        component: CompareEvents,
        dataTestId: "compare-events",
        vuex: [{
            clyModel: userovoCompareEvents
        }]
    });
})();
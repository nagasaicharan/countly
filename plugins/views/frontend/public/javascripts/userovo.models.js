/*global UserovoHelpers, userovoCommon, $, userovoSession, jQuery, userovoGlobal, CV, userovoVue, app, userovoAuth */

(function(userovoViews) {

    //Private Properties
    var _actionData = {},
        _activeAppKey = 0,
        _initialized = false,
        _segment = "",
        _segmentVal = "",
        _segments = [],
        _omit = [],
        _domains = [],
        _name = "views",
        _period = null,
        _tableData = [],
        _selectedViews = [],
        _graphDataObj = {},
        _viewsCount = 0,
        _viewsNames = {},
        FEATURE_NAME = 'views';


    UserovoHelpers.createMetricModel(userovoViews, {name: "views"}, jQuery);

    userovoViews.service = {
        fetchMetaData: function() {
            return CV.$.ajax({
                type: "GET",
                url: userovoCommon.API_PARTS.data.r,
                data: {
                    "app_id": userovoCommon.ACTIVE_APP_ID,
                    "method": "get_view_segments",
                    "skip_domains": true
                },
                dataType: "json",
                success: function(json) {
                    if (json && json.segments) {
                        for (var i = 0; i < json.segments.length; i++) {
                            json.segments[i] = userovoCommon.decode(json.segments[i]);
                        }
                        _segments = json.segments;
                        for (let segment in _segments) {
                            _segments[segment].sort(Intl.Collator().compare);
                        }
                    }
                    if (json && json.omit) {
                        for (let index = 0; index < json.omit.length; index++) {
                            json.omit[index] = userovoCommon.decode(json.omit[index]);
                        }
                        _omit = json.omit;
                        _omit.sort(Intl.Collator().compare);
                    }
                }
            });
        },
        fetchData: function(context) {
            _segment = context.state.selectedSegment;
            _segmentVal = context.state.selectedSegmentValue;
            return $.when(userovoViews.initialize());
        },
        fetchTotals: function() {
            var data = {
                "app_id": userovoCommon.ACTIVE_APP_ID,
                "method": "views",
                "period": userovoCommon.getPeriodAsDateStrings(),
                "action": "getTotals"
            };

            return CV.$.ajax({
                type: "GET",
                url: userovoCommon.API_PARTS.data.r,
                data: data,
                dataType: "json",
            }, {"disableAutoCatch": true});

        },
        fetchTotalViewsCount: function() {
            var data = {
                "app_id": userovoCommon.ACTIVE_APP_ID,
                "method": "views",
                "action": "get_view_count"
            };


            return CV.$.ajax({
                type: "GET",
                url: userovoCommon.API_PARTS.data.r,
                data: data,
                dataType: "json",
            }, {"disableAutoCatch": true});
        },
        updateViews: function(statusObj) {
            return CV.$.ajax({
                type: "POST",
                url: userovoCommon.API_PARTS.data.w + "/views",
                data: {
                    app_id: userovoCommon.ACTIVE_APP_ID,
                    data: JSON.stringify(statusObj),
                    "method": "rename_views",
                },
                dataType: "json"
            }, {"disableAutoCatch": true});
        },
        deleteViews: function(view) {
            return CV.$.ajax({
                type: "POST",
                url: userovoCommon.API_PARTS.data.w + "/views",
                data: {
                    app_id: userovoCommon.ACTIVE_APP_ID,
                    "method": "delete_view",
                    "view_id": view
                },
                dataType: "json"
            }, {"disableAutoCatch": true});
        },
        omitSegments: function(segments) {
            return CV.$.ajax({
                type: "POST",
                url: userovoCommon.API_PARTS.data.w + "/views",
                data: {
                    app_id: userovoCommon.ACTIVE_APP_ID,
                    "method": "omit_segments",
                    "omit_list": segments
                },
                dataType: "json"
            }, {"disableAutoCatch": true});
        }
    };

    var editTableResource = userovoVue.vuex.ServerDataTable("viewsEditTable", {
        columns: ['display', 'view'],
        loadedData: {},
        onRequest: function(context) {
            var data = {
                app_id: userovoCommon.ACTIVE_APP_ID,
                method: 'views',
                action: 'getTableNames',
                visibleColumns: JSON.stringify(context.state.params.selectedDynamicCols),
            };

            return {
                type: "GET",
                url: userovoCommon.API_PARTS.data.r,
                data: data
            };
        },
        onReady: function(context, rows) {
            for (var k = 0; k < rows.length; k++) {
                rows[k].display = rows[k].display || rows[k].view;
                rows[k].editedDisplay = rows[k].display;
            }
            return rows;
        },
        onError: function(context, error) {
            if (error) {
                if (error.status !== 0) { //not on canceled ones
                    app.activeView.onError(error);
                }
            }
        }
    });

    var viewsTableResource = userovoVue.vuex.ServerDataTable("viewsMainTable", {
        columns: ['name', 'u', 'n', 't', 'd', 's', 'e', 'b', 'br', 'uvc', 'scr', 'actionLink'],
        onRequest: function(context) {
            var data = {
                app_id: userovoCommon.ACTIVE_APP_ID,
                method: 'views',
                action: 'getTable',
                visibleColumns: JSON.stringify(context.state.params.selectedDynamicCols),
                period: userovoCommon.getPeriodAsDateStrings()
            };
            data = data || {};
            var selectedInfo = context.getters.selectedData;
            var selectedKey = selectedInfo.selectedSegment || "";//context.state.userovoViews.selectedSegment;
            var selectedValue = selectedInfo.selectedSegmentValue || "";//context.state.userovoViews.selectedSegmentValue;

            if (selectedKey !== "" && selectedValue !== "") {
                data.segment = selectedKey;
                data.segmentVal = selectedValue;
            }

            return {
                type: "GET",
                url: userovoCommon.API_PARTS.data.r,
                data: data
            };
        },
        onError: function(context, error) {
            if (error) {
                if (error.status !== 0) { //not on canceled ones
                    app.activeView.onError(error);
                }
            }
        },
        onReady: function(context, rows) {
            var selected = [];
            if (context && context.rootState && context.rootState.userovoViews) {
                selected = context.rootState.userovoViews.selectedViews;
            }
            var addSelected = 0;
            var addedSelected = [];
            if (selected.length === 0 && (context && context.state && context.state.params && context.state.params.page && context.state.params.page === 1)) { //if first page and nothing selected
                addSelected = 5;
            }
            for (var k = 0; k < rows.length; k++) {
                rows[k].view = rows[k].display || rows[k].view || rows[k]._id;
                if (rows[k].uvalue) {
                    rows[k].u = Math.min(rows[k].uvalue, rows[k].u);
                }
                if (rows[k].t > 0) {
                    rows[k].dCalc = userovoCommon.formatSecond(rows[k].d / rows[k].t);
                    var vv = parseFloat(rows[k].scr) / parseFloat(rows[k].t);
                    if (vv > 100) {
                        vv = 100;
                    }

                    rows[k].scrCalc = userovoCommon.formatNumber(vv) + "%";
                }
                else {
                    rows[k].dCalc = 0;
                    rows[k].scrCalc = 0;
                }

                rows[k].br = rows[k].br + "%";
                //FOR ACTION MAPS
                rows[k].actionLink = "unknown";
                rows[k].useDropdown = true;
                var url = "#/analytics/views/action-map/";
                if (userovoGlobal.apps[userovoCommon.ACTIVE_APP_ID].app_domain && userovoGlobal.apps[userovoCommon.ACTIVE_APP_ID].app_domain.length > 0) {
                    url = userovoGlobal.apps[userovoCommon.ACTIVE_APP_ID].app_domain;
                    if (url.indexOf("http") !== 0) {
                        url = "http://" + url;
                    }
                    if (url.substr(url.length - 1) === '/') {
                        url = url.substr(0, url.length - 1);
                    }
                    rows[k].useDropdown = false;
                }
                var link = rows[k]._id;
                if (rows[k].url) {
                    link = rows[k].url;
                }
                else if (rows[k].view) {
                    link = rows[k].view;
                }
                rows[k].actionLink = url + link;
                //'<a href=' + url + link + ' class="table-link green" data-localize="views.table.view" style="margin:0px; padding:2px;">' + CV.i18n("views.table.view"),+ '</a>';
                //FOR ACTION MAPS END
                if (addSelected) {
                    rows[k].selected = true;
                    addedSelected.push(rows[k]._id);
                    addSelected--;
                    selected.push(rows[k]._id);
                }
                if (selected.indexOf(rows[k]._id) > -1) {
                    rows[k].selected = true;
                }
                else {
                    rows[k].selected = false;
                }
            }
            if (addedSelected.length > 0) {
                var persistData = {};
                persistData["pageViewsItems_" + userovoCommon.ACTIVE_APP_ID] = addedSelected;
                userovoCommon.setPersistentSettings(persistData);
                context.dispatch('onSetSelectedViews', addedSelected);
            }
            return rows;
        }
    });

    userovoViews.helpers = {
        calculateGraphData: function(context) {
            var graphs = [];
            context.selectedViews = context.selectedViews || [];
            for (var p = 0; p < context.selectedViews.length; p++) {
                var chart = userovoViews.helpers.getChartData(context.data || {}, context.selectedViews[p], context.selectedProperty, "name", context.selectedSegment, context.selectedSegmentValue);
                if (chart && chart.data) {
                    graphs.push({"name": userovoViews.helpers.getChartLineName(context.data, context.selectedViews[p]), "_id": context.selectedViews[p], "data": chart.data});
                }
                else {
                    graphs.push({"name": userovoViews.helpers.getChartLineName(context.data, context.selectedViews[p]), "_id": context.selectedViews[p], "data": []});
                }
            }
            return graphs;
        },
        calculateGraphLabels: function(context) {
            context.selectedViews = context.selectedViews || [];
            var labels = [];
            for (var p = 0; p < context.selectedViews.length; p++) {
                labels.push({"name": (userovoViews.helpers.getChartLineName(context.data, context.selectedViews[p]) || context.selectedViews[p]), "_id": context.selectedViews[p]});
            }
            return labels;
        },
        getChartLineName: function(dataObj, path) {
            if (dataObj && dataObj[path] && dataObj[path + "_name"]) {
                return dataObj[path + "_name"];
            }
            else {
                return path;
            }
        },
        getTableData: function(dataObj, path, metric, name, segment, segmentVal) {
            if (segment === "") {
                segment = "no-segment";
            }
            var dbObj = {};
            if (dataObj && dataObj[path] && dataObj[path][segment]) {
                dbObj = dataObj[path][segment];
                if (Object.keys(dbObj).length === 0) {
                    return false;
                }
            }

            var chartData = [];
            var propData = [];
            var clearObject = userovoViews.clearObject();
            for (var key in clearObject) {
                chartData.push({"data": [], label: key});
                propData.push({"name": key});
            }

            var rr = userovoCommon.extractChartData(dbObj, userovoViews.clearObject, chartData, propData, segmentVal);

            var totals = {"t": 0, "u": 0, "s": 0, "b": 0, "e": 0, "d": 0, "n": 0, "uvc": 0, "scr": 0};
            for (var z = 0; z < rr.chartData.length; z++) {
                for (var key2 in clearObject) {
                    totals[key2] += (rr.chartData[z][key2] || 0);
                }
            }

            if (!userovoCommon.periodObj.isSpecialPeriod && userovoCommon.periodObj.activePeriod) {
                var ob1 = userovoCommon.getDescendantProp(dbObj, userovoCommon.periodObj.activePeriod) || {};
                totals.u = ob1.u || 0;
            }
            else {
            //fix value for u
                var uvalue1 = 0;
                var uvalue2 = 0;
                var l = 0;

                for (l = 0; l < (userovoCommon.periodObj.uniquePeriodArr.length); l++) {
                    var ob = userovoCommon.getDescendantProp(dbObj, userovoCommon.periodObj.uniquePeriodArr[l]) || {};
                    uvalue1 += ob.u || 0;
                }

                for (l = 0; l < (userovoCommon.periodObj.uniquePeriodCheckArr.length); l++) {
                    var ob2 = userovoCommon.getDescendantProp(dbObj, userovoCommon.periodObj.uniquePeriodCheckArr[l]) || {};
                    uvalue2 += ob2.u || 0;

                }
                totals.u = Math.max(totals.n, Math.min(totals.u, totals.t, uvalue1, uvalue2));
            }
            if (totals.t > 0) {
                totals.dCalc = userovoCommon.formatSecond(totals.d / totals.t);
                var vv = parseFloat(totals.scr) / parseFloat(totals.t);
                if (vv > 100) {
                    vv = 100;
                }
                totals.scrCalc = userovoCommon.formatNumber(vv) + "%";
                totals.br = Math.round(totals.b * 100 / totals.s);
            }
            else {
                totals.dCalc = 0;
                totals.scrCalc = 0;
                totals.br = 0;
            }
            return totals;
        },
        getChartData: function(dataObj, path, metric, name, segment, segmentVal) {
            if (segment === "") {
                segment = "no-segment";
            }
            var dbObj = {};
            if (dataObj && dataObj[path] && dataObj[path][segment]) {
                dbObj = dataObj[path][segment];
                if (Object.keys(dbObj).length === 0) {
                    return false;
                }
            }

            var chartData = [
                    { data: [], label: name, color: '#DDDDDD', mode: "ghost" },
                    { data: [], label: name, color: '#333933' }
                ],
                dataProps = [
                    {
                        name: "p" + metric,
                        func: function(dataObj2) {
                            return dataObj2[metric];
                        },
                        period: "previous"
                    },
                    { name: metric}
                ];
            if (metric === "br") {
                dataProps = [];


                dataProps.push({
                    "name": "ps",
                    func: function(dataObj2) {
                        return dataObj2.s;
                    },
                    period: "previous"
                });
                dataProps.push({"name": "s"});

                dataProps.push({
                    "name": "pb",
                    func: function(dataObj2) {
                        return dataObj2.b;
                    },
                    period: "previous"
                });
                dataProps.push({"name": "b"});

                chartData.push({ data: [], label: name, color: '#DDDDDD', mode: "ghost" });
                chartData.push({ data: [], label: name, color: '#333933' });
            }
            if (metric === "d") {
                dataProps = [];
                dataProps.push(
                    {
                        "name": "pd",
                        func: function(dataObj2) {
                            return dataObj2.s;
                        },
                        period: "previous"
                    },
                    {
                        "name": "d"
                    },
                    {
                        "name": "pt",
                        func: function(dataObj2) {
                            return dataObj2.b;
                        },
                        period: "previous"
                    },
                    {
                        "name": "t"
                    }
                );
                chartData.push(
                    { data: [], label: name, color: '#DDDDDD', mode: "ghost" },
                    { data: [], label: name, color: '#333933' }
                );
            }

            var calculated = userovoCommon.extractChartData(dbObj, userovoViews.clearObject, chartData, dataProps, segmentVal);

            var data = [];
            var takefrom = calculated.chartDP[1].data;
            if (metric === "br") {
                takefrom = calculated.chartDP[3].data;
                for (var k = 0; k < takefrom.length; k++) {
                    var bounceRate = Math.floor(takefrom[k][1] * 100 / (calculated.chartDP[1].data[k][1] || 1));
                    //there may be cases where bounces are higher than landing. Cap br to 100 for these cases
                    if (bounceRate > 100) {
                        bounceRate = 100;
                    }
                    data.push(bounceRate);
                }
            }
            if (metric === "d") {
                for (k = 0; k < takefrom.length; k++) {
                    var avgDuration = Math.floor(takefrom[k][1] / (calculated.chartDP[3].data[k][1] || 1));
                    data.push(avgDuration);
                }
            }
            else {
                for (var kz = 0; kz < takefrom.length; kz++) {
                    data.push(takefrom[kz][1]);
                }
            }
            return {"data": data};
        },
    };

    userovoViews.getVuexModule = function() {
        var getInitialState = function() {
            return {
                data: {},
                totals: {},
                isLoading: false,
                hasError: false,
                error: null,
                selectedProperty: "t",
                selectedSegment: "",
                updateError: "",
                selectedSegmentValue: "",
                selectedViews: [],
                segments: {},
                omittedSegments: [],
                domains: [],
                totalViewsCount: 0,
            };
        };

        var ViewsActions = {
            fetchMetaData: function(context) {
                return userovoViews.service.fetchMetaData()
                    .then(function() {
                        context.commit('setSegments', _segments);
                        context.commit('setOmittedSegments', _omit);
                        context.dispatch('onFetchSuccess');
                    }).catch(function(error) {
                        context.dispatch('onFetchError', error);
                    });
            },
            fetchTotals: function(context) {
                return userovoViews.service.fetchTotals()
                    .then(function(response) {
                        context.commit('setTotals', response || {});
                        context.dispatch('onFetchSuccess');
                    }).catch(function(error) {
                        context.dispatch('onFetchError', error);
                    });
            },
            fetchData: function(context) {
                return new Promise(function(resolve/*, reject*/) {
                    context.dispatch('onFetchInit');
                    userovoViews.service.fetchData(context)
                        .then(function() {
                            context.commit('setData', _graphDataObj || {});
                            context.commit('setSegments', _segments);
                            context.commit('setOmittedSegments', _omit);
                            context.commit('setDomains', _domains);
                            context.dispatch('onFetchSuccess');
                            resolve();
                        }).catch(function(error) {
                            context.dispatch('onFetchError', error);
                        });
                });
            },
            fetchTotalViewsCount: function(context) {
                return userovoViews.service.fetchTotalViewsCount()
                    .then(function(response) {
                        var value = 0;
                        if (response.result) {
                            value = response.result;
                        }
                        context.commit('setTotalViewCount', value);
                    }).catch(function(error) {
                        context.dispatch('onFetchError', error);
                    });
            },
            calculateGraphData: function(context) {
                return new Promise(function(resolve/*, reject*/) {
                    resolve(userovoViews.helpers.calculateGraphData(context.state));
                });
            },
            updateViews: function(context, data) {
                context.dispatch('onUpdateError', "");
                return userovoViews.service.updateViews(data).then(function() {
                    context.dispatch("fetchViewsEditTable");
                }).catch(function(error) {
                    context.dispatch('onUpdateError', error);
                });
            },
            deleteViews: function(context, data) {
                context.dispatch('onUpdateError', "");
                return userovoViews.service.deleteViews(data).then(function() {
                    context.dispatch("fetchViewsEditTable");
                }).catch(function(error) {
                    context.dispatch('onUpdateError', error);
                });
            },
            omitSegments: function(context, data) {
                context.dispatch('onUpdateError', "");
                return userovoViews.service.omitSegments(data).then(function() {

                }).catch(function(error) {
                    context.dispatch('onUpdateError', error);
                });
            },
            onFetchInit: function(context) {
                context.commit('setFetchInit');
            },
            onFetchError: function(context, error) {
                context.commit('setFetchError', error);
            },
            onUpdateError: function(context, error) {
                context.commit('setUpdateError', error);
            },
            onFetchSuccess: function(context) {
                context.commit('setFetchSuccess');
            },
            onSetSelectedProperty: function(context, value) {
                context.commit('setSelectedProperty', value);
            },
            onSetSelectedSegment: function(context, value) {
                context.commit('setSelectedSegment', value);
            },
            onSetSelectedSegmentValue: function(context, value) {
                context.commit('setSelectedSegmentValue', value);
            },
            onSetSelectedViews: function(context, value) {
                context.commit('setSelectedViews', value);
            },
        };

        var ViewsMutations = {
            setData: function(state, value) {
                state.data = value;
                state.loadNumber = value.ts;
            },
            setTotalViewCount: function(state, value) {
                state.totalViewsCount = value;
            },
            setTotals: function(state, value) {
                state.totals = value;
            },
            setSegments: function(state, value) {
                state.segments = value;
            },
            setOmittedSegments: function(state, value) {
                state.omittedSegments = value;
            },
            setDomains: function(state, value) {
                state.domains = value;
            },
            setFetchInit: function(state) {
                state.isLoading = true;
                state.hasError = false;
                state.error = null;
            },
            setFetchError: function(state, error) {
                state.isLoading = false;
                state.hasError = true;
                state.error = error;
            },
            setUpdateError: function(state, error) {
                if (error && error.responseJSON && error.responseJSON.result) {
                    error = error.responseJSON.result;
                }
                state.updateError = error;
            },
            setFetchSuccess: function(state) {
                state.isLoading = false;
                state.hasError = false;
                state.error = null;
            },
            setSelectedProperty: function(state, value) {
                state.selectedProperty = value;
            },
            setSelectedSegment: function(state, value) {
                state.selectedSegment = value;
                _segment = value;
            },
            setSelectedSegmentValue: function(state, value) {
                state.selectedSegmentValue = value;
                _segmentVal = value;
            },
            setSelectedViews: function(state, value) {
                state.selectedViews = value;
                _selectedViews = value;
            },
        };
        return userovoVue.vuex.Module("userovoViews", {
            state: getInitialState,
            actions: ViewsActions,
            getters: {
                selectedTableRows: function(context) {
                    var rows = [];

                    for (var p = 0; p < context.selectedViews.length; p++) {
                        var chart = userovoViews.helpers.getTableData(context.data || {}, context.selectedViews[p], context.selectedProperty, "name", context.selectedSegment, context.selectedSegmentValue);
                        if (chart) {
                            chart.view = userovoViews.helpers.getChartLineName(context.data, context.selectedViews[p]);
                            chart.name = userovoViews.helpers.getChartLineName(context.data, context.selectedViews[p]);
                            chart._id = context.selectedViews[p];
                            chart.selected = true;
                            rows.push(chart);
                        }
                        else {
                            var obj = userovoViews.clearObject();
                            obj.view = context.selectedViews[p];
                            obj.name = context.selectedViews[p];
                            obj._id = context.selectedViews[p];
                            obj.selected = true;
                            rows.push(obj);
                        }
                    }
                    return rows;
                },
                selectedData: function(context) {
                    return {
                        selectedSegment: context.selectedSegment,
                        selectedSegmentValue: context.selectedSegmentValue
                    };
                },
                updateError: function(context) {
                    return context.updateError;
                },
                getOmittedSegments: function(context) {
                    return context.omittedSegments;
                },
            },
            mutations: ViewsMutations,
            submodules: [viewsTableResource, editTableResource]
        });
    };



    //graphData['appID'][]
    //Public Methods
    userovoViews.initialize = function() {
        if (_initialized && _period === userovoCommon.getPeriodAsDateStrings() && _activeAppKey === userovoCommon.ACTIVE_APP_KEY) {
            return this.refresh();
        }

        _period = userovoCommon.getPeriodAsDateStrings();
        this.reset();
        if (!userovoCommon.DEBUG) {
            _activeAppKey = userovoCommon.ACTIVE_APP_KEY;
            _initialized = true;

            var selected = [];

            //load data
            for (var h = 0; h < _selectedViews.length; h++) {
                selected.push({'view': _selectedViews[h], "action": ""});
            }
            return $.when(
                $.ajax({
                    type: "GET",
                    url: userovoCommon.API_PARTS.data.r,
                    data: {
                        "app_id": userovoCommon.ACTIVE_APP_ID,
                        "method": "get_view_segments",
                        "period": _period
                    },
                    dataType: "json",
                    success: function(json) {
                        if (json && json.segments) {
                            for (var i = 0; i < json.segments.length; i++) {
                                json.segments[i] = userovoCommon.decode(json.segments[i]);
                            }
                            _segments = json.segments;
                            for (let segment in _segments) {
                                _segments[segment].sort(Intl.Collator().compare);
                            }
                            _domains = json.domains;
                        }
                        if (json && json.omit) {
                            for (let index = 0; index < json.omit.length; index++) {
                                json.omit[index] = userovoCommon.decode(json.omit[index]);
                            }
                            _omit = json.omit;
                            _omit.sort(Intl.Collator().compare);
                        }
                    }
                })
            ).then(//on initialize load only after getting list of selected
                function() {
                    return $.when($.ajax({
                        type: "GET",
                        url: userovoCommon.API_PARTS.data.r,
                        data: {
                            "app_id": userovoCommon.ACTIVE_APP_ID,
                            "method": _name,
                            "period": _period,
                            "selectedViews": JSON.stringify(selected),
                            "segment": _segment,
                            "segmentVal": _segmentVal
                        },
                        dataType: "json",
                        success: function(json) {
                            if (json.data && json.appID === userovoCommon.ACTIVE_APP_ID) {
                                _graphDataObj = json.data;
                            }
                        }
                    })).then(function() {
                        return true;
                    });
                }
            );
        }
        else {
            return true;
        }
    };

    userovoViews.loadList = function(id) {
        $.ajax({
            type: "GET",
            url: userovoCommon.API_PARTS.data.r,
            data: {
                "app_id": id,
                "action": "listNames",
                "method": "views",
                "list": 1,
                "preventRequestAbort": true
            },
            dataType: "json",
            success: function(json) {
                _viewsNames = {};
                if (json && json.length > 0) {
                    for (var i = 0; i < json.length; i++) {
                        _viewsNames[json[i].view] = json[i].display || json[i].view;
                    }
                }
            }
        });
    };

    if (userovoGlobal.member && userovoGlobal.member.api_key && userovoCommon.ACTIVE_APP_ID !== 0 && userovoAuth.validateRead(FEATURE_NAME) && UserovoHelpers.isPluginEnabled(FEATURE_NAME)) {
        userovoViews.loadList(userovoCommon.ACTIVE_APP_ID);
    }


    /** Function gets view display name if it is set.
    * @param {string} id  - view
    * @returns {string}  - view name
    */
    userovoViews.getViewName = function(id) {
        if (_viewsNames[id]) {
            return _viewsNames[id];
        }
        return id;
    };

    /** Function gets array of view display names
    * @returns {object}  - view names
    */
    userovoViews.getViewsNames = function() {
        return _viewsNames;
    };

    /** Reverse function. Returns 'view' value from display name
    * @param {string} name  - display name
    * @returns {string}  - view value
    */
    userovoViews.getViewView = function(name) {
        for (var p in _viewsNames) {
            if (_viewsNames[p] === name) {
                return p;
            }
        }
        return name;
    };


    /** Function gets list of 'view' values from display names. Useful when searching in names
    * @param {string} name  - view display name
    * @returns {array} list if view values
    */
    userovoViews.getCodesFromName = function(name) {
        var list = [];
        for (var p in _viewsNames) {
            if (_viewsNames[p].startsWith(name)) {
                list.push(p);
            }
        }
        return list;
    };

    //currently this function is used from other parts in userovo. Keeo wrapper.
    userovoViews.loadViewCount = function() {
        return userovoViews.service.fetchTotalViewsCount().then(function(response) {
            if (response.result) {
                _viewsCount = response.result;
            }
        }).catch(function() {

        });

    };
    userovoViews.refresh = function() {
        if (!userovoCommon.DEBUG) {

            if (_activeAppKey !== userovoCommon.ACTIVE_APP_KEY) {
                _activeAppKey = userovoCommon.ACTIVE_APP_KEY;
                this.reset();
                return this.initialize();
            }

            if (!_initialized) {
                return this.initialize();
            }
            var periodIsOk = true;
            if (_period !== userovoCommon.getPeriodAsDateStrings()) {
                periodIsOk = false;
            }
            _period = userovoCommon.getPeriodAsDateStrings();

            var selected = [];

            //if refresh
            for (var i = 0; i < _selectedViews.length; i++) {
                if (periodIsOk && ((_segment === "" && _graphDataObj[_selectedViews[i]] && _graphDataObj[_selectedViews[i]]['_no-segment'] && Object.keys(_graphDataObj[_selectedViews[i]]['_no-segment']).length !== 0) ||
                    (_segment !== "" && _graphDataObj[_selectedViews[i]] && _graphDataObj[_selectedViews[i]][_segment] && Object.keys(_graphDataObj[_selectedViews[i]][_segment]).length !== 0))
                ) {
                    selected.push({'view': _selectedViews[i], "action": "refresh"});
                }
                else {
                    selected.push({'view': _selectedViews[i], "action": ""});
                }
            }
            return $.when(
                $.ajax({
                    type: "GET",
                    url: userovoCommon.API_PARTS.data.r,
                    data: {
                        "app_id": userovoCommon.ACTIVE_APP_ID,
                        "method": "get_view_segments",
                        "period": _period,
                        "display_loader": false
                    },
                    dataType: "json",
                    success: function(json) {
                        if (json && json.segments) {
                            for (var z = 0; z < json.segments.length; z++) {
                                json.segments[z] = userovoCommon.decode(json.segments[z]);
                            }
                            _segments = json.segments;
                            for (let segment in _segments) {
                                _segments[segment].sort(Intl.Collator().compare);
                            }
                            _domains = json.domains;
                        }
                        if (json && json.omit) {
                            for (let index = 0; index < json.omit.length; index++) {
                                json.omit[index] = userovoCommon.decode(json.omit[index]);
                            }
                            _omit = json.omit;
                            _omit.sort(Intl.Collator().compare);
                        }
                    }
                }),
                $.ajax({
                    type: "GET",
                    url: userovoCommon.API_PARTS.data.r,
                    data: {
                        "app_id": userovoCommon.ACTIVE_APP_ID,
                        "method": _name,
                        "action": "",
                        "period": _period,
                        "selectedViews": JSON.stringify(selected),
                        "segment": _segment,
                        "segmentVal": _segmentVal
                    },
                    dataType: "json",
                    success: function(json) {
                        if (json.data && json.appID === userovoCommon.ACTIVE_APP_ID) {
                            json = json.data;
                            for (var k in json) {
                                if (k.indexOf("_name") > -1) {
                                    _graphDataObj[k] = json[k]; //copy new name
                                }
                                else if (_graphDataObj[k]) {
                                    for (var z in json[k]) {

                                        if (_graphDataObj[k][z]) {
                                            userovoCommon.extendDbObj(_graphDataObj[k][z], json[k][z]);
                                        }
                                        else {
                                            _graphDataObj[k][z] = json[k][z];
                                        }
                                    }

                                }
                                else {
                                    _graphDataObj[k] = json[k];
                                }
                            }
                        }
                    }
                })
            ).then(function() {
                return true;
            });
        }
        else {
            return true;
        }
    };

    userovoViews._reset = userovoViews.reset;
    userovoViews.reset = function() {
        _actionData = {};
        _initialized = false;
        _segments = [];
        _domains = [];
        _omit = [];
        userovoViews._reset();
        _graphDataObj = {};
    };

    userovoViews.setSelectedViews = function(selected) {
        _selectedViews = selected;
    };
    userovoViews.setSegment = function(segment) {
        _segment = userovoCommon.decode(segment);
        _segmentVal = "";
    };

    userovoViews.setSegmentValue = function(segment) {
        _segmentVal = userovoCommon.decode(segment);
    };

    userovoViews.getSegments = function() {
        return _segments;
    };

    userovoViews.getViewsCount = function() {
        return _viewsCount;
    };

    userovoViews.getSegmentKeys = function() {
        var segments = [];
        for (var key in _segments) {
            segments.push(key);
        }
        return segments;
    };

    userovoViews.getDomains = function() {
        return _domains;
    };

    userovoViews.loadActionsData = function(view) {
        _period = userovoCommon.getPeriodAsDateStrings();

        return $.when(
            $.ajax({
                type: "GET",
                url: userovoCommon.API_PARTS.data.r,
                data: {
                    "app_id": userovoCommon.ACTIVE_APP_ID,
                    "method": "get_view_segments",
                    "period": _period
                },
                dataType: "json",
                success: function(json) {
                    if (json && json.segments) {
                        for (var i = 0; i < json.segments.length; i++) {
                            json.segments[i] = userovoCommon.decode(json.segments[i]);
                        }
                        _segments = json.segments;
                        for (let segment in _segments) {
                            _segments[segment].sort(Intl.Collator().compare);
                        }
                    }
                }
            }),
            $.ajax({
                type: "GET",
                url: userovoCommon.API_PARTS.data.r + "/actions",
                data: {
                    "app_id": userovoCommon.ACTIVE_APP_ID,
                    "view": view,
                    "segment": _segment,
                    "period": _period
                },
                dataType: "json",
                success: function(json) {
                    _actionData = json;
                }
            })
        ).then(function() {
            return true;
        });
    };

    userovoViews.getActionsData = function() {
        return _actionData;
    };

    userovoViews.getChartData = function(path, metric, name, segment, segmentVal) {
        var chartData = [
                { data: [], label: name, color: '#DDDDDD', mode: "ghost" },
                { data: [], label: name, color: '#333933' }
            ],
            dataProps = [
                {
                    name: "p" + metric,
                    func: function(dataObj) {
                        return dataObj[metric];
                    },
                    period: "previous"
                },
                { name: metric}
            ];
        if (segment === "") {
            segment = "no-segment";
        }
        var dbObj = {};
        if (_graphDataObj && _graphDataObj[path] && _graphDataObj[path][segment]) {
            dbObj = _graphDataObj[path][segment];
            if (Object.keys(dbObj).length === 0) {
                return false;
            }
        }
        return userovoCommon.extractChartData(dbObj, userovoViews.clearObject, chartData, dataProps, segmentVal);
    };

    userovoViews.getData = function() {

        var chartData = {};
        chartData.chartData = _tableData;

        var values = ["u", "t", "s", "b", "e", "d", "n", "scr"];
        for (var z = 0; z < chartData.chartData.length; z++) {
            for (var p = 0; p < values.length; p++) {
                chartData.chartData[z][values[p]] = chartData.chartData[z][values[p]] || 0;
            }

        }
        /*chartData.chartData={};
        var chartData = userovoCommon.extractTwoLevelData(userovoViews.getDb(), userovoViews.getMeta(), userovoViews.clearObject, [
            {
                name: _name,
                func: function(rangeArr) {
                    return userovoCommon.decode(rangeArr);
                }
            },
            { "name": "u" },
            { "name": "t" },
            { "name": "s" },
            { "name": "b" },
            { "name": "e" },
            { "name": "d" },
            { "name": "n" },
            { "name": "scr" }
        ]);

        chartData.chartData = userovoCommon.mergeMetricsByName(chartData.chartData, _name);*/

        return chartData;
    };

    userovoViews.setWidgetData = function(data) {
        userovoViews.setDb(data);
    };

    userovoViews.clearObject = function(obj) {
        if (obj) {
            if (!obj.u) {
                obj.u = 0;
            }
            if (!obj.t) {
                obj.t = 0;
            }
            if (!obj.n) {
                obj.n = 0;
            }
            if (!obj.s) {
                obj.s = 0;
            }
            if (!obj.e) {
                obj.e = 0;
            }
            if (!obj.b) {
                obj.b = 0;
            }
            if (!obj.d) {
                obj.d = 0;
            }
            if (!obj.scr) {
                obj.scr = 0;
            }
            if (!obj.uvc) {
                obj.uvc = 0;
            }
        }
        else {
            obj = {"u": 0, "t": 0, "n": 0, "s": 0, "e": 0, "b": 0, "d": 0, "scr": 0, "uvc": 0};
        }
        return obj;
    };

    /* userovoViews.renameViews = function(data, callback) {
        $.ajax({
            type: "POST",
            url: userovoCommon.API_PARTS.data.w + '/views',
            data: {
                "app_id": userovoCommon.ACTIVE_APP_ID,
                "method": "rename_views",
                "data": JSON.stringify(data)
            },
            dataType: "json",
            success: function(json) {
                userovoViews.loadList(userovoCommon.ACTIVE_APP_ID); //reload views list
                if (typeof callback === "function") {
                    callback(json);
                }
            },
            error: function() {
                if (typeof callback === "function") {
                    callback(false);
                }
            }
        });
    };
    userovoViews.deleteView = function(view, callback) {
        return $.ajax({
            type: "POST",
            url: userovoCommon.API_PARTS.data.w + '/views',
            data: {
                "app_id": userovoCommon.ACTIVE_APP_ID,
                "method": "delete_view",
                "view_id": view
            },
            dataType: "json",
            success: function(json) {
                userovoViews.loadList(userovoCommon.ACTIVE_APP_ID); //reload views list
                if (json && json.result) {
                    json = json.result;
                }
                if (typeof callback === "function") {
                    callback(json);
                }
            },
            error: function() {
                if (typeof callback === "function") {
                    callback(false);
                }
            }
        });
    };*/

}(window.userovoViews = window.userovoViews || {}));

(function(userovoViewsPerSession) {
    userovoViewsPerSession.helpers = {
        getViewsPerSessionRange: function() {
            var visits = jQuery.i18n.map["views.visits"].toLowerCase();
            return [
                "1 - 2 " + visits,
                "3 - 5 " + visits,
                "6 - 10 " + visits,
                "11 - 15 " + visits,
                "16 - 30 " + visits,
                "31 - 50 " + visits,
                "51 - 100 " + visits,
                "> 100 " + visits
            ];
        },
        explainViewsPerSessionRange: function(index) {
            return userovoViewsPerSession.helpers.getViewsPerSessionRange()[index];
        }
    };

    userovoViewsPerSession.service = {

        mapViewsPerSessionSeries: function(dto) {
            var viewsPerSessionSerieData = dto.chartData.map(function(chartDataItem) {
                return chartDataItem.t;
            });
            return [{data: viewsPerSessionSerieData, label: CV.i18n("views-per-session.title")}];
        },
        mapViewsPerSessionRows: function(dto) {
            var rows = [];
            dto.chartData.forEach(function(chartDataItem, index) {
                rows[index] = {
                    viewsBuckets: chartDataItem.vc,
                    weight: index,
                    numberOfSessions: chartDataItem.t,
                    percentage: chartDataItem.percentageNumber
                };
            });
            return rows;
        },
        mapViewsPerSessionDtoToModel: function(dto) {
            var viewsPerSessionModel = {
                series: [],
                rows: []
            };
            viewsPerSessionModel.series = this.mapViewsPerSessionSeries(dto);
            viewsPerSessionModel.rows = this.mapViewsPerSessionRows(dto);
            return viewsPerSessionModel;
        },

        fetchViewsPerSession: function() {
            var self = this;
            return new Promise(function(resolve, reject) {
                userovoSession.initialize()
                    .then(function() {
                        var viewsPerSessionData = userovoSession.getRangeData("vc", "v-ranges", userovoViewsPerSession.helpers.explainViewsPerSessionRange, userovoViewsPerSession.helpers.getViewsPerSessionRange());
                        resolve(self.mapViewsPerSessionDtoToModel(viewsPerSessionData));
                    }).catch(function(error) {
                        reject(error);
                    });
            });
        }
    };

    userovoViewsPerSession.getVuexModule = function() {

        var getInitialState = function() {
            return {
                viewsPerSession: {
                    rows: [],
                    series: []
                }
            };
        };

        var viewsPerSessionActions = {
            fetchAll: function(context, useLoader) {
                context.dispatch('onFetchInit', {useLoader: useLoader});
                userovoViewsPerSession.service.fetchViewsPerSession()
                    .then(function(response) {
                        context.commit('setViewsPerSession', response);
                        context.dispatch('onFetchSuccess', {useLoader: useLoader});
                    }).catch(function(error) {
                        context.dispatch('onFetchError', {error: error, useLoader: useLoader});
                    });
            }
        };

        var viewsPerSessionMutations = {
            setViewsPerSession: function(state, value) {
                state.viewsPerSession = value;
            }
        };

        return userovoVue.vuex.Module("userovoViewsPerSession", {
            state: getInitialState,
            actions: viewsPerSessionActions,
            mutations: viewsPerSessionMutations,
            submodules: [userovoVue.vuex.FetchMixin()]
        });
    };
}(window.userovoViewsPerSession = window.userovoViewsPerSession || {}));

/*global $, jQuery, UserovoHelpers, userovoCommon,userovoTotalUsers,userovoVue*/
(function(userovoLanguage) {

    var langmap;
    /**
		* Get language name from language code
		* @param {string} code - language code
		* @returns {string} language name
		*/
    userovoLanguage.getLanguageName = function(code) {
        if (langmap && langmap[code]) {
            return langmap[code].englishName;
        }
        else {
            return code;
        }
    },

    /** Function gets list of language codes
		* @param {string} name  - language name
		* @returns{array} list if language codes
		*/

    userovoLanguage.getCodesFromName = function(name) {
        var codes = [];
        var lowerCase = name.toLowerCase();
        if (langmap) {
            for (var p in langmap) {
                if (langmap[p].englishName.toLowerCase().startsWith(lowerCase)) {
                    codes.push(p);
                }
            }
        }
        return codes;
    };

    UserovoHelpers.createMetricModel(userovoLanguage, {name: "langs", estOverrideMetric: "languages"}, jQuery, userovoLanguage.getLanguageName);

    userovoLanguage.service = {
        fetchData: function() {
            return $.when(userovoLanguage.service.loadLangMap(), userovoLanguage.initialize(), userovoTotalUsers.initialize("locale"));
        },
        loadLangMap: function() {
            if (!langmap) {
                return $.ajax({
                    type: "GET",
                    url: userovoCommon.API_PARTS.data.r + "/langmap",
                    dataType: "json",
                    data: {"preventRequestAbort": true},
                    success: function(json) {
                        langmap = json;
                    }
                });
            }
            else {
                return true;
            }
        },
        mapLanguageDtoToModel: function() {
            var metric = "langs";
            var tableData = userovoCommon.extractTwoLevelData(userovoLanguage.getDb(), userovoLanguage.getMeta("langs"), userovoLanguage.clearObject, [
                {
                    name: "langs",
                    func: userovoLanguage.getLanguageName
                },
                { "name": "t" },
                { "name": "u" },
                { "name": "n" }
            ], metric);

            tableData = tableData.chartData || [];
            var graphs = {"newUsers": [], "totalSessions": []};
            var totals = {"totalSessions": 0, "newUsers": 0, "totalUsers": 0};
            for (var k = 0; k < tableData.length; k++) {
                graphs.newUsers.push({"name": tableData[k][metric], "value": tableData[k].n});
                graphs.totalSessions.push({"name": tableData[k][metric], "value": tableData[k].t});
                totals.newUsers += tableData[k].n;
                totals.totalSessions += tableData[k].t;
                totals.totalUsers += tableData[k].u;
            }
            //add % of t to table 
            for (var kz = 0; kz < tableData.length; kz++) {
                tableData[kz].tPerc = Math.round((tableData[kz].t || 0) * 1000 / (totals.totalSessions || 1)) / 10;
                tableData[kz].uPerc = Math.round((tableData[kz].u || 0) * 1000 / (totals.totalUsers || 1)) / 10;
                tableData[kz].nPerc = Math.round((tableData[kz].n || 0) * 1000 / (totals.newUsers || 1)) / 10;
            }
            return {"table": tableData, "pie": graphs, totals: totals};
        },
    };

    userovoLanguage.getVuexModule = function() {
        var getInitialState = function() {
            return {
                Language: {"pie": {"newUsers": [], "totalSessions": []}, "totals": {}, "table": []},
                seriesTotal: {},
                isLoading: true,
                hasError: false,
                error: null
            };
        };

        var LanguageActions = {
            fetchAll: function(context, force) {
                context.dispatch('onFetchInit', force);
                userovoLanguage.service.fetchData()
                    .then(function(response) {
                        var dataModel = userovoLanguage.service.mapLanguageDtoToModel(response);
                        context.commit('setLanguage', dataModel);
                        context.dispatch('onFetchSuccess');
                    }).catch(function(error) {
                        context.dispatch('onFetchError', error);
                    });
            },
            onFetchInit: function(context, force) {
                context.commit('setFetchInit', force);
            },
            onFetchError: function(context, error) {
                context.commit('setFetchError', error);
            },
            onFetchSuccess: function(context) {
                context.commit('setFetchSuccess');
            }
        };

        var LanguageMutations = {
            setLanguage: function(state, value) {
                state.Language = value;
                state.Language.pie = state.Language.pie || {};
                state.Language.table = state.Language.table || [];
            },
            setFetchInit: function(state, force) {
                if (force) {
                    state.isLoading = true;
                }
                state.hasError = false;
                state.error = null;
            },
            setFetchError: function(state, error) {
                state.isLoading = false;
                state.hasError = true;
                state.error = error;
            },
            setFetchSuccess: function(state) {
                state.isLoading = false;
                state.hasError = false;
                state.error = null;
            }
        };
        return userovoVue.vuex.Module("userovoLanguage", {
            state: getInitialState,
            actions: LanguageActions,
            mutations: LanguageMutations,
            getters: {
                isLoading: function(state) {
                    return state.isLoading;
                }
            }
        });
    };
    if (UserovoHelpers.isPluginEnabled("locale")) {
        userovoLanguage.service.loadLangMap(); //calling language map load. used for other plugins
    }

}(window.userovoLanguage = window.userovoLanguage || {}));
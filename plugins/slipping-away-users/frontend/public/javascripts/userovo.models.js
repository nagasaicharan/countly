/*global userovoCommon,userovoVue,CV*/
(function(userovoSlippingAwayUsers) {

    userovoSlippingAwayUsers.service = {
        mapSeries: function(dto) {
            return dto.map(function(item) {
                return item.count;
            });
        },
        mapDtoToModel: function(dto) {
            var slippingAwayUsersModel = {
                series: [],
                rows: []
            };
            slippingAwayUsersModel.series = this.mapSeries(dto);
            slippingAwayUsersModel.rows = dto;
            return slippingAwayUsersModel;
        },
        fetchSlippingAwayUsers: function(filters) {
            var self = this;
            var data = {
                app_id: userovoCommon.ACTIVE_APP_ID,
                method: 'slipping',
                query: JSON.stringify(filters)
            };
            if (filters) {
                data.query = JSON.stringify(filters);
            }
            return new Promise(function(resolve, reject) {
                CV.$.ajax({
                    type: "GET",
                    url: userovoCommon.API_URL + "/o/slipping",
                    data: data
                }, {disableAutoCatch: true})
                    .then(function(response) {
                        resolve(self.mapDtoToModel(response));
                    }).catch(function(error) {
                        reject(error);
                    });
            });
        }
    };

    userovoSlippingAwayUsers.getVuexModule = function() {
        var getInitialState = function() {
            return {
                rows: [],
                series: [],
                filters: { query: {}, byVal: []},
            };
        };

        var slippingAwayUsersActions = {
            fetchAll: function(context, useLoader) {
                context.dispatch('onFetchInit', {useLoader: useLoader});
                userovoSlippingAwayUsers.service.fetchSlippingAwayUsers(context.state.filters.query)
                    .then(function(response) {
                        context.commit('setSlippingAwayUsers', response);
                        context.dispatch('onFetchSuccess', {useLoader: useLoader});
                    }).catch(function(error) {
                        context.dispatch('onFetchError', {error: error, useLoader: useLoader});
                    });
            },
            onSetFilters: function(context, filters) {
                context.commit('setFilters', filters);
            }
        };

        var slippingAwayUsersMutations = {
            setSlippingAwayUsers: function(state, value) {
                state.rows = value.rows;
                state.series = value.series;
            },
            setFilters: function(state, value) {
                state.filters = value;
            }
        };

        return userovoVue.vuex.Module("userovoSlippingAwayUsers", {
            state: getInitialState,
            actions: slippingAwayUsersActions,
            mutations: slippingAwayUsersMutations,
            submodules: [userovoVue.vuex.FetchMixin()]
        });
    };
}(window.userovoSlippingAwayUsers = window.userovoSlippingAwayUsers || {}));
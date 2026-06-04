/*global app,userovoGlobal, userovoSlippingAwayUsers,userovoVue,CV,userovoCommon,UserovoHelpers,userovoAuth*/
(function() {

    var FEATURE_NAME = "slipping_away_users";

    var SlippingAwayUsersView = userovoVue.views.create({
        template: CV.T("/slipping-away-users/templates/slipping-away-users.html"),
        mixins: [userovoVue.mixins.commonFormatters],
        data: function() {
            return {
                progressBarColor: "#F96300"
            };
        },
        computed: {
            showViewUsers: function() {
                return userovoGlobal.plugins.indexOf('users') > -1;
            },

            showDrillFilter: function() {
                if (userovoAuth.validateRead('drill') && userovoGlobal.plugins.indexOf("drill") !== -1) {
                    return true;
                }
                else {
                    return false;
                }
            },
            slippingAwayUsersFilters: {
                get: function() {
                    return this.$store.state.userovoSlippingAwayUsers.filters;
                },
                set: function(value) {
                    this.$store.dispatch('userovoSlippingAwayUsers/onSetFilters', value);
                    this.$store.dispatch("userovoSlippingAwayUsers/fetchAll", true);
                    if (value.query) {
                        app.navigate("#/analytics/loyalty/slipping-away-users/" + JSON.stringify(value.query));
                    }
                    else {
                        app.navigate("#/analytics/loyalty/slipping-away-users/");
                    }
                }
            },
            slippingAwayUsersOptions: function() {
                return {
                    xAxis: {
                        data: this.xAxisSlippingAwayUsersPeriods,
                        axisLabel: {
                            color: "#333C48"
                        }
                    },
                    series: [{
                        data: this.$store.state.userovoSlippingAwayUsers.series,
                        name: CV.i18n('slipping-away-users.barchart-description'),
                        color: this.progressBarColor

                    }]
                };
            },
            slippingAwayUsersRows: function() {
                return this.$store.state.userovoSlippingAwayUsers.rows;
            },
            xAxisSlippingAwayUsersPeriods: function() {
                var periods = [];
                this.slippingAwayUsersRows.forEach(function(element) {
                    periods.push(CV.i18n('slipping-away-users.serie-item', element.period));
                });
                return periods;
            },
            isLoading: function() {
                return this.$store.getters['userovoSlippingAwayUsers/isLoading'];
            }
        },
        methods: {
            onUserListClick: function(timeStamp) {
                var data = {
                    lac: {"$lt": timeStamp}
                };
                var currentFilters = this.$store.state.userovoSlippingAwayUsers.filters;
                if (currentFilters.query) {
                    Object.assign(data, currentFilters.query);
                }
                UserovoHelpers.goTo({
                    url: '/users/query/' + JSON.stringify(data),
                    from: "#/" + userovoCommon.ACTIVE_APP_ID + "/analytics/loyalty/slipping-away-users",
                    title: CV.i18n("slipping-away-users.back-to-slipping-away")
                });
            },
            refresh: function() {
                this.$store.dispatch("userovoSlippingAwayUsers/fetchAll", false);
            },
        },
        mounted: function() {
            if (this.$route.params && this.$route.params.query) {
                this.$store.dispatch('userovoSlippingAwayUsers/onSetFilters', {query: this.$route.params.query });
            }
            this.$store.dispatch("userovoSlippingAwayUsers/fetchAll", true);
        }
    });

    userovoVue.container.registerTab("/analytics/loyalty", {
        priority: 2,
        name: "slipping-away-users",
        permission: FEATURE_NAME,
        pluginName: "slipping-away-users",
        title: CV.i18n('slipping-away-users.title'),
        route: "#/analytics/loyalty/slipping-away-users",
        dataTestId: "slipping-away",
        component: SlippingAwayUsersView,
        vuex: [{
            clyModel: userovoSlippingAwayUsers
        }]
    });

    if (app.configurationsView) {
        app.configurationsView.registerLabel("slipping-away-users", "slipping-away-users.config-title");
        app.configurationsView.registerLabel("slipping-away-users.p1", "slipping-away-users.config-first-threshold");
        app.configurationsView.registerLabel("slipping-away-users.p2", "slipping-away-users.config-second-threshold");
        app.configurationsView.registerLabel("slipping-away-users.p3", "slipping-away-users.config-third-threshold");
        app.configurationsView.registerLabel("slipping-away-users.p4", "slipping-away-users.config-fourth-threshold");
        app.configurationsView.registerLabel("slipping-away-users.p5", "slipping-away-users.config-fifth-threshold");
    }
})();
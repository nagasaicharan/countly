/*globals $,userovoErrorLogs,userovoGlobal,jQuery,UserovoHelpers,app,userovoVue,CV,userovoAuth */
(function() {
    var FEATURE_NAME = "errorlogs";
    var ErrorLogsView = userovoVue.views.create({
        template: CV.T('/errorlogs/templates/logs.html'),
        data: function() {
            return {
                selectLog: this.query || "api",
                downloadLink: userovoGlobal.path + "/o/errorlogs?download=true&log=" + this.query || "api",
                logList: [{name: jQuery.i18n.map["errorlogs.api-log"] || "Api Log", value: "api"}],
                authToken: userovoGlobal.auth_token,
                cachedLog: {}
            };
        },
        props: {
            query: {
                default: "api"
            }
        },
        created: function() {
            var self = this;
            return $.when(userovoErrorLogs.initialize(), userovoErrorLogs.getLogByName(this.query || "api"))
                .then(function() {
                    self.logList = userovoErrorLogs.getLogNameList();
                    self.cachedLog = userovoErrorLogs.getLogCached();
                });
        },
        methods: {
            refresh: function(force) {
                var self = this;
                if (force) {
                    return $.when(userovoErrorLogs.getLogByName(this.selectLog))
                        .then(function() {
                            self.cachedLog = userovoErrorLogs.getLogCached();
                        });
                }
            },
            changeLog: function(value) {
                this.downloadLink = userovoGlobal.path + "/o/errorlogs?download=true&log=" + value,
                app.navigate("#/manage/logs/errorlogs/" + value);
                this.refresh(true);
            },
            clear: function() {
                var self = this;
                UserovoHelpers.confirm(jQuery.i18n.map["errorlogs.confirm-delete-" + self.selectLog] || jQuery.i18n.map["errorlogs.confirm-delete"], "popStyleGreen", function(result) {
                    if (!result) {
                        return true;
                    }
                    $.when(userovoErrorLogs.del(self.selectLog)).then(function(resData) {
                        if (resData.result === "Success") {
                            $.when(userovoErrorLogs.initialize()).then(function() {
                                userovoErrorLogs.getLogByName(self.selectLog, function() {
                                    self.refresh(true);
                                });
                            });
                        }
                        else {
                            UserovoHelpers.alert(resData.result, "red");
                        }
                    });
                }, [jQuery.i18n.map["common.no-dont-delete"], jQuery.i18n.map["common.yes-clear-it"]], {title: jQuery.i18n.map["errorlogs.confirm-delete-" + self.selectLog + "-title"] || jQuery.i18n.map["errorlogs.confirm-delete-title"], image: "clear-api-logs"});
            },
            download: function() {
                document.forms.errorlogsform.submit();
                return false;
            }
        }
    });
    if (userovoAuth.validateGlobalAdmin()) {
        userovoVue.container.registerTab("/manage/logs", {
            priority: 1,
            route: "#/manage/logs/errorlogs",
            component: ErrorLogsView,
            title: jQuery.i18n.map["errorlogs.server-logs"] || "Server Logs",
            name: "errorlogs",
            permission: FEATURE_NAME,
            vuex: []
        });
    }
})();

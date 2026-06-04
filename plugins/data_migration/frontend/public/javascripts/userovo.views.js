/*global userovoVue, CV, userovoCommon, UserovoHelpers, userovoGlobal, userovoDataMigration, app,jQuery */
(function() {
    var FEATURE_NAME = 'data_migration';

    var ImportsTab = userovoVue.views.create({
        template: CV.T("/data_migration/templates/imports-tab.html"),
        props: {},
        mixins: [
            userovoVue.mixins.auth(FEATURE_NAME)
        ],
        data: function() {
            return {
                list: [],
                importsTablePersistKey: 'imports_table_' + userovoCommon.ACTIVE_APP_ID,
                isLoading: false
            };
        },
        methods: {
            refresh: function(force) {
                this.loadImports(force);
            },
            loadImports: function(forceLoading) {
                if (forceLoading) {
                    this.isLoading = true;
                }
                var self = this;
                userovoDataMigration.loadImportList()
                    .then(function(res) {
                        if (typeof res.result === "object") {
                            var finalArr = [];
                            for (var key in res.result) {
                                var element = res.result[key];
                                finalArr.push(element);
                            }
                            self.list = finalArr;
                        }
                        else if (typeof res.result === "string") {
                            self.list = [];
                        }
                        self.isLoading = false;
                    });
            },
            handleCommand: function(command, scope, row) {
                switch (command) {
                case 'download-log':
                    window.location.href = "/data-migration/download?logfile=" + row.log;
                    break;
                case 'delete-export':
                    var self = this;
                    UserovoHelpers.confirm(CV.i18n('data-migration.delete-export-confirm'), "popStyleGreen", function(result) {
                        if (!result) {
                            return true;
                        }
                        userovoDataMigration.deleteImport(row.key, function(res) {
                            if (res.result === 'success') {
                                self.loadImports();
                                UserovoHelpers.notify({
                                    type: 'success',
                                    message: CV.i18n('data-migration.export-deleted')
                                });
                            }
                            else {
                                UserovoHelpers.notify({
                                    type: 'error',
                                    message: CV.i18n(res.data.xhr.responseJSON.result)
                                });
                            }
                        });
                    }, [], { title: CV.i18n('management-users.warning'), image: 'delete-exports' });
                    break;
                }
            }
        },
        created: function() {
            this.loadImports(true);
        }
    });

    var ExportsTab = userovoVue.views.create({
        template: CV.T("/data_migration/templates/exports-tab.html"),
        props: {},
        mixins: [
            userovoVue.mixins.auth(FEATURE_NAME)
        ],
        data: function() {
            return {
                list: [],
                exportsTablePersistKey: 'exports_table_' + userovoCommon.ACTIVE_APP_ID,
                isLoading: false,
                isGlobalAdmin: userovoGlobal.member.global_admin
            };
        },
        methods: {
            refresh: function(force) {
                this.loadExports(force);
            },
            loadExports: function(forceLoading) {
                var self = this;
                if (forceLoading) {
                    this.isLoading = true;
                }
                userovoDataMigration.loadExportList()
                    .then(function(res) {
                        if (typeof res.result === "object") {
                            self.list = res.result;
                        }
                        else if (typeof res.result === "string") {
                            self.list = [];
                        }
                        self.isLoading = false;
                    });
            },
            handleCommand: function(command, scope, row) {
                var self = this;
                switch (command) {
                case 'download-log':
                    window.location.href = "/data-migration/download?logfile=" + row.log;
                    break;
                case 'download-export':
                    window.location.href = "/data-migration/download?id=" + row._id;
                    break;
                case 'resend':
                    userovoDataMigration.sendExport(row._id, row.server_token, row.server_address, row.redirect_traffic, function(res) {
                        if (res.result === 'success') {
                            UserovoHelpers.notify({
                                type: 'success',
                                message: CV.i18n('data-migration.export-started')
                            });
                        }
                        else {
                            UserovoHelpers.notify({
                                type: 'error',
                                message: CV.i18n(res.data.xhr.responseJSON.result)
                            });
                        }
                    });
                    break;
                case 'delete-export':
                    UserovoHelpers.confirm(CV.i18n('data-migration.delete-export-confirm'), "popStyleGreen", function(result) {
                        if (!result) {
                            return true;
                        }
                        userovoDataMigration.deleteExport(row._id, function(res) {
                            if (res.result === 'success') {
                                self.loadExports();
                                UserovoHelpers.notify({
                                    type: 'success',
                                    message: CV.i18n('data-migration.export-deleted')
                                });
                            }
                            else {
                                UserovoHelpers.notify({
                                    type: 'error',
                                    message: CV.i18n(res.data.xhr.responseJSON.result)
                                });
                            }
                        });
                    }, [], { title: CV.i18n('management-users.warning'), image: 'delete-exports' });
                    break;
                case 'stop-export':
                    userovoDataMigration.stopExport(row._id, function(res) {
                        if (res.result === 'success') {
                            self.loadExports();
                            UserovoHelpers.notify({
                                type: 'success',
                                message: CV.i18n('data-migration.export-stopped')
                            });
                        }
                        else {
                            UserovoHelpers.notify({
                                type: 'error',
                                message: CV.i18n(res.data.xhr.responseJSON.result)
                            });
                        }
                    });
                    break;
                }
            }
        },
        created: function() {
            this.loadExports(true);
        }
    });

    var ImportDrawer = userovoVue.views.create({
        template: CV.T("/data_migration/templates/drawer-import.html"),
        props: {
            settings: Object,
            controls: Object
        },
        data: function() {
            return {
                serverDomain: userovoGlobal.domain,
                serverToken: '',
                tokenGenerated: false,
                importDropzoneOptions: {
                    createImageThumbnails: false,
                    autoProcessQueue: false,
                    addRemoveLinks: true,
                    acceptedFiles: 'application/gzip,application/x-gzip',
                    dictDefaultMessage: this.i18n('feedback.drop-message'),
                    dictRemoveFile: this.i18n('feedback.remove-file'),
                    url: "/i/datamigration/import",
                    paramName: "import_file",
                    params: { api_key: userovoGlobal.member.api_key, app_id: userovoCommon.ACTIVE_APP_ID }
                },
                importDrawerCancelButtonLabel: CV.i18n('data-migration.cancel'),
                importDrawerSaveButtonLabel: CV.i18n('data-migration.import-title')
            };
        },
        methods: {
            onSubmit: function(submitted) {
                var self = this;
                if (submitted.from_server === 1) {
                    userovoDataMigration.createToken(function(res) {
                        if (res.result === "success") {
                            self.serverToken = res.data;
                            self.tokenGenerated = true;
                            UserovoHelpers.notify({
                                type: 'success',
                                message: CV.i18n('data-migration.generated-token')
                            });
                            self.importDrawerCancelButtonLabel = CV.i18n('data-migration.close');
                            self.importDrawerSaveButtonLabel = "";
                        }
                        else {
                            UserovoHelpers.notify({
                                type: 'error',
                                message: CV.i18n(res.data.xhr.responseJSON.result)
                            });
                        }
                        // set drawer pending state false
                        self.$refs.importDrawer.isSubmitPending = false;
                    });
                }
                else {
                    self.$refs.importDropzone.processQueue();
                }
            },
            onComplete: function(res) {
                if (res.xhr.status === 200) {
                    UserovoHelpers.notify({
                        type: 'success',
                        message: CV.i18n('data-migration.import-started')
                    });
                }
                else {
                    UserovoHelpers.notify({
                        type: 'error',
                        message: CV.i18n(res.data.xhr.responseJSON.result)
                    });
                }
                // set pending false and
                // close drawer
                this.$refs.importDrawer.isSubmitPending = false;
                this.$refs.importDrawer.doClose();
            },
            onOpen: function() {
                this.tokenGenerated = false;
                this.importDrawerCancelButtonLabel = CV.i18n('data-migration.cancel');
                this.importDrawerSaveButtonLabel = CV.i18n('data-migration.create-token');
            },
            updateImportType: function(type) {
                if (type === 1) {
                    this.importDrawerSaveButtonLabel = CV.i18n('data-migration.create-token');
                }
                else {
                    this.importDrawerSaveButtonLabel = CV.i18n('data-migration.import-title');
                }
            },
            copy: function(type) {
                var text = document.querySelector('#data-migration-server-' + type + '-input');
                text.select();
                document.execCommand("copy");
                var message = '';
                if (type === 'token') {
                    message = 'data-migration.tokken-coppied-in-clipboard';
                }
                else {
                    message = 'data-migration.address-coppied-in-clipboard';
                }
                UserovoHelpers.notify({
                    type: 'info',
                    message: CV.i18n(message)
                });
            }
        }
    });

    var ExportDrawer = userovoVue.views.create({
        template: CV.T("/data_migration/templates/drawer-export.html"),
        props: {
            settings: Object,
            controls: Object
        },
        data: function() {
            return {
                apps: [],
                exportDrawerSaveButtonLabel: CV.i18n('data-migration.export-data-button')
            };
        },
        methods: {
            onClose: function() {},
            onSubmit: function(submitted) {
                var API_KEY = userovoGlobal.member.api_key;
                var APP_ID = userovoCommon.ACTIVE_APP_ID;

                var requestData = submitted;
                requestData.api_key = API_KEY;
                requestData.app_id = APP_ID;
                requestData.apps = submitted.apps.join(",");
                requestData.aditional_files = requestData.aditional_files ? 1 : 0;
                requestData.redirect_traffic = requestData.redirect_traffic ? 1 : 0;

                userovoDataMigration.saveExport(requestData, function(res) {
                    if (res.result === "success") {
                        if (requestData.only_export === 2) {
                            var data = res.data;
                            //pack data and download
                            var blob = new Blob([data], { type: 'application/x-sh' });
                            var url = URL.createObjectURL(blob);
                            var a = document.createElement('a');
                            a.href = url;
                            a.download = 'export_commands.sh';
                            document.body.appendChild(a);
                            a.click();
                            UserovoHelpers.notify({
                                type: 'success',
                                message: CV.i18n('data-migration.download-auto')
                            });
                        }
                        else {
                            UserovoHelpers.notify({
                                type: 'success',
                                message: CV.i18n('data-migration.export-started')
                            });
                        }
                    }
                    else {
                        UserovoHelpers.notify({
                            type: 'error',
                            message: CV.i18n(res.data.xhr.responseJSON.result)
                        });
                    }
                });
            },
            onOpen: function() {}
        },
        created: function() {
            var apps = Object.keys(userovoGlobal.apps);
            for (var i = 0; i < apps.length; i++) {
                this.apps.push({
                    label: userovoGlobal.apps[apps[i]].name,
                    value: userovoGlobal.apps[apps[i]]._id
                });
            }

            this.apps.sort(function(a, b) {
                const aLabel = a?.label || '';
                const bLabel = b?.label || '';
                const locale = userovoCommon.BROWSER_LANG || 'en';

                if (aLabel && bLabel) {
                    return aLabel.localeCompare(bLabel, locale, { numeric: true }) || 0;
                }

                // Move items with no label to the end
                if (!aLabel && bLabel) {
                    return 1;
                }

                if (aLabel && !bLabel) {
                    return -1;
                }

                return 0;
            });
        }
    });

    var DataMigrationMain = userovoVue.views.create({
        template: CV.T("/data_migration/templates/main.html"),
        components: {
            'import-drawer': ImportDrawer,
            'export-drawer': ExportDrawer
        },
        mixins: [
            userovoVue.mixins.hasDrawers("import"),
            userovoVue.mixins.hasDrawers("export"),
            userovoVue.mixins.auth(FEATURE_NAME)
        ],
        data: function() {
            return {
                dynamicTab: "imports",
                tabs: [
                    {
                        title: CV.i18n('data-migration.imports'),
                        name: "imports",
                        component: ImportsTab
                    },
                    {
                        title: CV.i18n('data-migration.exports'),
                        name: "exports",
                        component: ExportsTab
                    }
                ],
                drawerSettings: {
                    import: {
                        title: CV.i18n('data-migration.import-data')
                    },
                    export: {
                        title: CV.i18n('data-migration.export-data')
                    }
                }
            };
        },
        methods: {
            create: function(type) {
                if (typeof type === "undefined") {
                    type = "import";
                }
                var initialDrawerObject = {
                    import: {
                        import_file: "",
                        from_server: 1
                    },
                    export: {
                        target_path: "",
                        server_address: "",
                        server_token: "",
                        apps: [], // comma separated strings
                        only_export: 0, // 1
                        aditional_files: 0, // 1
                        redirect_traffic: 0 // 1
                    }
                };

                this.openDrawer(type, initialDrawerObject[type]);
            },
            handleCommand: function(command) {
                this.create(command);
            }
        }
    });

    var DataMigrationMainView = new userovoVue.views.BackboneWrapper({
        component: DataMigrationMain
    });

    //register route
    app.route('/manage/data-migration', 'datamigration', function() {
        this.renderWhenReady(DataMigrationMainView);
    });


    //switching apps. show message if redirect url is set
    app.addAppSwitchCallback(function(appId) {
        if (appId && userovoGlobal.apps[appId] && userovoGlobal.apps[appId].redirect_url && userovoGlobal.apps[appId].redirect_url !== "") {
            var mm = "<h4 class='bu-pt-3 bu-pb-1' style='overflow-wrap: break-word;'>" + jQuery.i18n.map["data-migration.app-redirected"].replace('{app_name}', userovoGlobal.apps[appId].name) + "</h4><p bu-pt-1>" + jQuery.i18n.map["data-migration.app-redirected-explanation"] + " <b><span style='overflow-wrap: break-word;'>" + userovoGlobal.apps[appId].redirect_url + "<span></b><p><a href='#/manage/apps' style='color:rgb(1, 102, 214); cursor:pointer;'>" + jQuery.i18n.map["data-migration.app-redirected-remove"] + "</a>";
            var msg = {
                title: jQuery.i18n.map["data-migration.app-redirected"].replace('{app_name}', userovoGlobal.apps[appId].name),
                message: mm,
                info: jQuery.i18n.map["data-migration.app-redirected-remove"],
                sticky: true,
                clearAll: true,
                type: "warning",
                onClick: function() {
                    app.navigate("#/manage/apps", true);
                }
            };
            UserovoHelpers.notify(msg);
        }
    });

    app.addMenu("management", {code: "data-migration", permission: FEATURE_NAME, url: "#/manage/data-migration", text: "data-migration.page-title", icon: '<div class="logo-icon fa fa-arrows-alt-h"></div>', priority: 70});
})();

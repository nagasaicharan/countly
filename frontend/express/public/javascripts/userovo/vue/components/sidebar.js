/* global app, jQuery, CV, Vue, userovoGlobal, _, Backbone, store, moment, userovoCommon, UserovoHelpers, userovoCMS */

(function(userovoVue, $) {

    $(document).ready(function() {
        var AppsMixin = {
            computed: {
                allApps: {
                    get: function() {
                        var storedApp = this.$store.getters["userovoCommon/getAllApps"];
                        var apps = _.sortBy(storedApp, function(app) {
                            return (app.name + "").toLowerCase();
                        });
                        if (userovoGlobal.member.appSortList) {
                            apps = this.sortBy(apps, userovoGlobal.member.appSortList);
                        }
                        apps = apps.map(function(a) {
                            a.image = userovoGlobal.path + "/appimages/" + a._id + ".png";
                            a.label = a.name;
                            a.value = a._id;
                            return a;
                        });
                        return apps;
                    },
                },
                activeApp: function() {
                    var selectedAppId = this.$store.getters["userovoCommon/getActiveApp"] && this.$store.getters["userovoCommon/getActiveApp"]._id;
                    var active = this.allApps.find(function(a) {
                        return a._id === selectedAppId;
                    });

                    if (active) {
                        active.image = userovoGlobal.path + "/appimages/" + active._id + ".png";
                    }
                    return active || {};
                },
            },
            methods: {
                sortBy: function(arrayToSort, sortList) {
                    if (!sortList.length) {
                        return arrayToSort;
                    }

                    var tmpArr = [],
                        retArr = [];

                    var i;
                    for (i = 0; i < arrayToSort.length; i++) {
                        var objId = arrayToSort[i]._id + "";
                        if (sortList.indexOf(objId) !== -1) {
                            tmpArr[sortList.indexOf(objId)] = arrayToSort[i];
                        }
                    }

                    for (i = 0; i < tmpArr.length; i++) {
                        if (tmpArr[i]) {
                            retArr[retArr.length] = tmpArr[i];
                        }
                    }

                    for (i = 0; i < arrayToSort.length; i++) {
                        if (retArr.indexOf(arrayToSort[i]) === -1) {
                            retArr[retArr.length] = arrayToSort[i];
                        }
                    }

                    return retArr;
                }
            }
        };

        var AppSelector = userovoVue.views.create({
            template: CV.T('/javascripts/userovo/vue/templates/sidebar/app-selector.html'),
            data: function() {
                return {
                    centerDialogVisible: true
                };
            },
            computed: {
                activeApp: {
                    get: function() {
                        var app = this.$store.getters["userovoCommon/getActiveApp"];
                        return app && app._id;
                    },
                    set: function(activeApp) {
                        this.onChange(activeApp);
                    }
                },
                showCompare: function() {
                    var cc = userovoVue.container.dataMixin({
                        'compareComponent': '/apps/compare'
                    });
                    var component = cc.data();
                    if (component && component.compareComponent && component.compareComponent.length > 0) {
                        return component.compareComponent[0].enabled.default || false;
                    }
                    return false;
                },
            },
            props: {
                allApps: {
                    type: Array
                }
            },
            methods: {
                compare: function() {
                    app.navigate("#/compare", true);
                    this.$emit("close");
                },
                onChange: function(id) {
                    this.$store.dispatch("userovoSidebar/deselectGuidesButton");
                    var selectedApp = this.allApps.find(function(a) {
                        return a._id === id;
                    });

                    var appKey = selectedApp.key;
                    var appName = selectedApp.name;
                    var appId = selectedApp._id;
                    if (app.activeAppKey !== appKey) {
                        app.activeAppName = appName;
                        app.activeAppKey = appKey;
                        app.switchApp(appId);
                    }
                    this.handleClose();
                },
                handleClose: function() {
                    this.$emit("close");
                }
            }
        });

        var UsersMenu = userovoVue.views.create({
            template: CV.T('/javascripts/userovo/vue/templates/sidebar/users-menu.html'),
            props: {
                item: {
                    type: Object
                }
            },
            data: function() {
                return {
                    helpCenterLink: {
                        isString: typeof userovoGlobal.usermenu.helpCenterLink === "string" ? userovoGlobal.usermenu.helpCenterLink : false,
                        isBoolean: typeof userovoGlobal.usermenu.helpCenterLink === "boolean" && userovoGlobal.usermenu.helpCenterLink
                    },
                    documentationLink: {
                        isString: typeof userovoGlobal.usermenu.documentationLink === "string" ? userovoGlobal.usermenu.documentationLink : false,
                        isBoolean: typeof userovoGlobal.usermenu.documentationLink === "boolean" && userovoGlobal.usermenu.documentationLink
                    },
                    feedbackLink: {
                        isString: typeof userovoGlobal.usermenu.feedbackLink === "string" ? userovoGlobal.usermenu.feedbackLink : false
                    },
                    featureRequestLink: {
                        isString: typeof userovoGlobal.usermenu.featureRequestLink === "string" ? userovoGlobal.usermenu.featureRequestLink : false,
                        isBoolean: typeof userovoGlobal.usermenu.featureRequestLink === "boolean" && userovoGlobal.usermenu.featureRequestLink
                    },
                    successMessage: CV.i18n("sidebar.copy-api-key-success-message"),
                    errorMessage: CV.i18n("common.copy-error-message")
                };
            },
            methods: {
                logout: function() {
                    this.$store.dispatch("userovoCommon/removeActiveApp");
                    store.remove('userovo_date');
                    store.remove('userovo_location_city');
                    this.logoutRequest();
                },
                logoutRequest: function() {
                    var logoutForm = document.createElement("form");
                    logoutForm.action = userovoGlobal.path + '/logout';
                    logoutForm.method = "post";
                    logoutForm.style.display = "none";
                    logoutForm.type = "submit";
                    var logoutForm_csrf = document.createElement("input");
                    logoutForm_csrf.name = '_csrf';
                    logoutForm_csrf.value = userovoGlobal.csrf_token;
                    logoutForm.appendChild(logoutForm_csrf);
                    document.body.appendChild(logoutForm);
                    logoutForm.submit();
                    document.body.removeChild(logoutForm);
                },
                onCopy: function() {
                    UserovoHelpers.notify({
                        message: this.successMessage,
                        type: "success"
                    });
                },
                onError: function() {
                    UserovoHelpers.notify({
                        message: this.errorMessage,
                        type: "error"
                    });
                },
                unselectUserovoGuides: function() {
                    this.$store.dispatch("userovoSidebar/deselectGuidesButton");
                }
            }
        });

        var ValidationMixin = {
            methods: {
                validate: function(item) {
                    var valid = true;

                    var tabsValidated = this.validateTabs(item);

                    return valid && tabsValidated;
                },
                validateTabs: function(item) {
                    var valid = true;

                    if (item.tabsPath) {
                        var tbs = userovoVue.container.tabsMixin({
                            t: item.tabsPath
                        });

                        var tabs = tbs.data().t;

                        valid = (tabs.length > 0);
                    }

                    return valid;
                }
            }
        };

        var AnalyticsMenu = userovoVue.views.create({
            template: CV.T('/javascripts/userovo/vue/templates/sidebar/analytics-menu.html'),
            mixins: [AppsMixin, ValidationMixin],
            components: {
                "app-selector": AppSelector
            },
            data: function() {
                return {
                    selectedAnalyticsMenu: null,
                    appSelector: false
                };
            },
            computed: {
                categories: function() {
                    if (!this.activeApp || !this.activeApp._id) {
                        return [];
                    }

                    var c = userovoVue.container.dataMixin({
                        categories: "/sidebar/analytics/menuCategory"
                    });

                    var cats = c.data().categories;

                    return cats;
                },
                categorizedMenus: function() {
                    if (!this.activeApp || !this.activeApp._id) {
                        return {};
                    }

                    var m = userovoVue.container.dataMixin({
                        menus: "/sidebar/analytics/menu"
                    });

                    var mm = m.data().menus;

                    var self = this;
                    var menus = mm.reduce(function(acc, val) {
                        if (val.app_type === self.activeApp.type) {
                            if (self.validate(val)) {
                                if (!acc[val.category]) {
                                    acc[val.category] = [];
                                }

                                acc[val.category].push(val);
                            }
                        }
                        return acc;
                    }, {});

                    return menus;
                },
                categorizedSubmenus: function() {
                    if (!this.activeApp || !this.activeApp._id) {
                        return {};
                    }

                    var s = userovoVue.container.dataMixin({
                        submenus: "/sidebar/analytics/submenu"
                    });

                    var sbm = s.data().submenus;

                    var self = this;
                    var submenus = sbm.reduce(function(acc, val) {
                        if (val.app_type === self.activeApp.type) {
                            if (self.validate(val)) {
                                if (!acc[val.parent_code]) {
                                    acc[val.parent_code] = [];
                                }

                                acc[val.parent_code].push(val);
                            }
                        }
                        return acc;
                    }, {});

                    return submenus;
                },
                selectedMenuItem: function() {
                    var selected = this.$store.getters["userovoSidebar/getSelectedMenuItem"];
                    if (selected && selected.menu === "analytics") {
                        this.selectedAnalyticsMenu = selected.item && selected.item.parent_code;
                        return selected.item;
                    }

                    return {};
                }
            },
            methods: {
                suffixIconClass: function(dropdown) {
                    return (dropdown.visible ? 'arrow-up is-reverse' : 'arrow-up');
                },
                onMenuItemClick: function(item) {
                    this.$store.dispatch("userovoSidebar/updateSelectedMenuItem", {menu: "analytics", item: item});
                    this.$store.dispatch("userovoSidebar/deselectGuidesButton");
                },
                identifySelected: function() {
                    var currLink = Backbone.history.fragment;
                    if (/^\/custom/.test(currLink) === true) {
                        return;
                    }
                    var menus = this.categorizedMenus;
                    var submenus = this.categorizedSubmenus;
                    var foundMenu = false;
                    var currMenu;
                    var part1 = "";
                    var part2 = "";
                    var part3 = "";
                    var menu;

                    for (var k in menus) {
                        for (var i = 0; i < menus[k].length; i++) {
                            menu = menus[k][i];


                            if (menu.url === "#" + currLink) {
                                foundMenu = true;
                                currMenu = menu;
                                break;
                            }

                            if (currLink.split("/").length > 2) {
                                part1 = "/" + currLink.split("/")[1];
                                part2 = part1 + "/" + currLink.split("/")[2];
                                part3 = part2 + "/";
                                if (menu.url === "#" + part1 || menu.url === "#" + part2 || menu.url === "#" + part3) {
                                    foundMenu = true;
                                    currMenu = menu;
                                    break;
                                }
                            }
                        }

                        if (foundMenu) {
                            break;
                        }
                    }

                    if (!foundMenu) {
                        for (var l in submenus) {
                            for (var j = 0; j < submenus[l].length; j++) {
                                menu = submenus[l][j];

                                if (menu.url === "#" + currLink) {
                                    foundMenu = true;
                                    currMenu = menu;
                                    break;
                                }

                                if (currLink.split("/").length > 2) {
                                    part1 = "/" + currLink.split("/")[1];
                                    part2 = part1 + "/" + currLink.split("/")[2];
                                    part3 = part2 + "/";
                                    if (menu.url === "#" + part1 || menu.url === "#" + part2 || menu.url === "#" + part3) {
                                        foundMenu = true;
                                        currMenu = menu;
                                        break;
                                    }
                                }
                            }

                            if (foundMenu) {
                                break;
                            }
                        }
                    }

                    if (currMenu) {
                        this.$store.dispatch("userovoSidebar/updateSelectedMenuItem", { menu: "analytics", item: currMenu });
                    }
                    else {
                        var selected = this.$store.getters["userovoSidebar/getSelectedMenuItem"];
                        if (selected.menu === "analytics") {
                            /**
                             * Incase the selected menu is already analytics, we need to reset
                             * the selected item to {}. Since we did not find the menu item.
                             *
                             * This is important as there are urls in userovo like /versions,
                             * which are not in the sidebar. So for them we don't need to highlight
                             * anything.
                             */
                            this.$store.dispatch("userovoSidebar/updateSelectedMenuItem", { menu: "analytics", item: {} });
                        }
                    }
                },
                toggleAppSelection: function() {
                    this.appSelector = !this.appSelector;
                }
            }
        });

        var ManagementMenu = userovoVue.views.create({
            template: CV.T('/javascripts/userovo/vue/templates/sidebar/management-menu.html'),
            mixins: [AppsMixin, ValidationMixin],
            computed: {
                menu: function() {
                    if (!this.activeApp || !this.activeApp._id) {
                        return [];
                    }
                    var m = userovoVue.container.dataMixin({
                        menus: "/sidebar/analytics/menu"
                    });

                    var mm = m.data().menus;
                    var self = this;

                    var menu = mm.filter(function(val) {
                        if (val.category === "management" && self.validate(val)) {
                            return true;
                        }

                        return false;
                    });

                    this.$emit("management-menu-ready", menu);
                    return menu;
                },
                selectedMenuItem: function() {
                    var selected = this.$store.getters["userovoSidebar/getSelectedMenuItem"];
                    if (selected && selected.menu === "management") {
                        return selected.item;
                    }

                    return {};
                }
            },
            methods: {
                onMenuItemClick: function(item) {
                    this.$store.dispatch("userovoSidebar/updateSelectedMenuItem", {menu: "management", item: item});
                    this.$store.dispatch("userovoSidebar/deselectGuidesButton");
                },
                identifySelected: function() {
                    var currLink = Backbone.history.fragment;
                    if (/^\/custom/.test(currLink) === true) {
                        return;
                    }
                    var menu = this.menu;

                    var currMenu = menu.find(function(m) {
                        return m.url === currLink;
                    });

                    if (!currMenu) {
                        if (currLink.split("/").length > 2) {
                            var part1 = "/" + currLink.split("/")[1];
                            var part2 = part1 + "/" + currLink.split("/")[2];
                            currMenu = menu.find(function(m) {
                                return (m.url === "#" + part1 || m.url === "#" + part2);
                            });
                        }
                    }

                    if (currMenu) {
                        this.$store.dispatch("userovoSidebar/updateSelectedMenuItem", { menu: "management", item: currMenu });
                    }
                    else {
                        var selected = this.$store.getters["userovoSidebar/getSelectedMenuItem"];
                        if (selected.menu === "management") {
                            /**
                             * Incase the selected menu is already management, we need to reset
                             * the selected item to {}. Since we did not find the menu item.
                             *
                             * This is important as there are urls in userovo like /versions,
                             * which are not in the sidebar. So for them we don't need to highlight
                             * anything.
                             */
                            this.$store.dispatch("userovoSidebar/updateSelectedMenuItem", { menu: "management", item: {} });
                        }
                    }
                }
            }
        });

        var LanguageMenu = userovoVue.views.create({
            template: CV.T('/javascripts/userovo/vue/templates/sidebar/language-menu.html'),
            data: function() {
                return {
                    localLang: userovoCommon.BROWSER_LANG_SHORT
                };
            },
            computed: {
                allLanguages: function() {
                    return userovoGlobal.languages.map(function(l) {
                        return {
                            label: l.name,
                            value: l.code
                        };
                    });
                },
                selLang: {
                    get: function() {
                        return this.localLang;
                    },
                    set: function(langCode) {
                        store.set("userovo_lang", langCode);
                        userovoCommon.BROWSER_LANG_SHORT = langCode;
                        userovoCommon.BROWSER_LANG = langCode;

                        this.localLang = langCode;

                        try {
                            moment.locale(userovoCommon.BROWSER_LANG_SHORT);
                        }
                        catch (e) {
                            moment.locale("en");
                        }

                        userovoCommon.getMonths(true);

                        CV.$.ajax({
                            type: "POST",
                            url: userovoGlobal.path + "/user/settings/lang",
                            data: {
                                "username": userovoGlobal.member.username,
                                "lang": userovoCommon.BROWSER_LANG_SHORT,
                                _csrf: userovoGlobal.csrf_token
                            },
                            success: function() {
                                window.location.reload(true);
                            },
                            error: function() {
                                //we could output error here
                                window.location.reload(true);
                            }
                        });
                    }
                }
            }
        });

        var SidebarView = userovoVue.views.create({
            template: CV.T('/javascripts/userovo/vue/templates/sidebar/sidebar.html'),
            mixins: [
                userovoVue.container.dataMixin({
                    "externalMainMenuOptions": "/sidebar/menu/main",
                    "externalOtherMenuOptions": "/sidebar/menu/other"
                })
            ],
            components: {
                "users-menu": UsersMenu,
                "analytics-menu": AnalyticsMenu,
                "management-menu": ManagementMenu,
                "language-menu": LanguageMenu
            },
            data: function() {
                return {
                    selectedMenuOptionLocal: null,
                    versionInfo: userovoGlobal.userovoTypeName,
                    userovoSidebarVersionPath: '/dashboard#/' + userovoCommon.ACTIVE_APP_ID + '/versions',
                    showMainMenu: true,
                    redirectHomePage: 'dashboard#/' + userovoCommon.ACTIVE_APP_ID,
                    onOptionsMenu: false,
                    onMainMenu: false,
                    enableGuides: UserovoHelpers.isPluginEnabled('guides'),
                    defaultMainMenuOptions: [
                        {
                            name: "app",
                            icon: "cly-icon-sidebar-app",
                            noSelect: true
                        },
                        {
                            name: "analytics",
                            icon: "cly-icon-sidebar-analytics",
                            tooltip: CV.i18n("sidebar.main-menu")
                        },
                        {
                            name: "divider",
                            icon: "cly-icon-sidebar-divider",
                            noSelect: true
                        },
                        {
                            name: "management",
                            icon: "cly-icon-sidebar-management",
                            tooltip: "Management",
                            svg: ""
                        },
                        {
                            name: "last-queries",
                            icon: "cly-icon-sidebar-report-manager",
                            noSelect: true,
                            tooltip: "Report Manager"
                        }
                    ]
                };
            },
            computed: {
                components: function() {
                    var menuOptions = [];

                    var externalMainMenuOptions = this.externalMainMenuOptions;
                    var externalOtherMenuOptions = this.externalOtherMenuOptions;

                    if (externalMainMenuOptions && externalMainMenuOptions.length) {
                        menuOptions = menuOptions.concat(externalMainMenuOptions);
                    }

                    if (externalOtherMenuOptions && externalOtherMenuOptions.length) {
                        menuOptions = menuOptions.concat(externalOtherMenuOptions);
                    }

                    return menuOptions;
                },
                mainMenuOptions: function() {
                    var menuOptions = JSON.parse(JSON.stringify(this.defaultMainMenuOptions));

                    var externalMainMenuOptions = this.externalMainMenuOptions;

                    if (externalMainMenuOptions && externalMainMenuOptions.length) {
                        for (var i = 0; i < externalMainMenuOptions.length; i++) {
                            menuOptions.splice(2, 0, externalMainMenuOptions[i]);
                        }
                    }

                    return menuOptions;
                },
                otherMenuOptions: function() {
                    var menuOptions = [
                        {
                            name: this.enableGuides ? "userovo-guides" : "help-center",
                            icon: this.enableGuides ? "cly-icon-sidebar-userovo-guides" : "cly-icon-sidebar-help-center",
                            noSelect: true,
                            tooltip: this.enableGuides ? "Userovo Guides" : "Help Center"
                        },
                        {
                            name: "user",
                            noSelect: true,
                            member: this.member,
                            tooltip: CV.i18n("sidebar.my-profile")
                        },
                        {
                            name: "language",
                            noSelect: true,
                            tooltip: "Language"
                        },
                        {
                            name: "toggle",
                            icon: "cly-icon-sidebar-toggle-left",
                            noSelect: true
                        }
                    ];

                    var externalOtherMenuOptions = this.externalOtherMenuOptions;

                    if (externalOtherMenuOptions && externalOtherMenuOptions.length) {
                        for (var i = 0; i < externalOtherMenuOptions.length; i++) {
                            menuOptions.splice(3, 0, externalOtherMenuOptions[i]);
                        }
                    }

                    return menuOptions;
                },
                member: function() {
                    //We should fetch the user from vuex
                    //So that updates are reactive

                    var userImage = {};
                    var member = userovoGlobal.member;
                    if (member.member_image) {
                        userImage.url = member.member_image;
                        userImage.found = true;
                    }
                    else {
                        var defaultAvatarSelector = (member.created_at || Date.now()) % 10 * -60;
                        var name = member.full_name.split(" ");

                        userImage.found = false;
                        userImage.url = "images/avatar-sprite.png?v2";
                        userImage.position = defaultAvatarSelector;
                        userImage.initials = name[0][0] + name[name.length - 1][0];
                    }

                    member.image = userImage;

                    return member;
                },
                pseudoSelectedMenuOption: function() {
                    var selected = this.$store.getters["userovoSidebar/getSelectedMenuItem"];

                    var state = this.$store.getters["userovoSidebar/getGuidesButton"];
                    if (state === 'selected') {
                        return 'guides';
                    }

                    if (!this.selectedMenuOptionLocal && selected) {
                        return selected.menu;
                    }
                    return this.selectedMenuOptionLocal;
                },
                visibleSidebarMenu: function() {
                    var selected = this.$store.getters["userovoSidebar/getSelectedMenuItem"];

                    if (!this.selectedMenuOptionLocal && selected) {
                        return selected.menu;
                    }
                    return this.selectedMenuOptionLocal;
                },
                selectedMenuOption: function() {
                    var selected = this.$store.getters["userovoSidebar/getSelectedMenuItem"];
                    return selected && selected.menu;
                },
                guidesButtonDynamicClass: function() {
                    var state = this.$store.getters["userovoSidebar/getGuidesButton"];
                    if (state === 'selected') {
                        return 'color:#12AF51; font-size:larger;';
                    }
                    else if (state === 'hover' || state === 'highlighted') {
                        return 'color:white; font-size:larger;';
                    }
                    else {
                        return 'color:#A7AEB8; font-size:larger;';
                    }
                },
                helpCenterLink: function() {
                    return this.enableGuides ? '#/guides' : "https://support.count.ly";
                },
                helpCenterTarget: function() {
                    return this.enableGuides ? '_self' : "_blank";
                },
                isCommunityEdition: function() {
                    return userovoGlobal.userovoTypeCE;
                }
            },
            methods: {
                guidesMouseOver: function() {
                    var state = this.$store.getters["userovoSidebar/getGuidesButton"];
                    if (state !== 'selected' && state !== 'highlighted') {
                        this.$store.dispatch("userovoSidebar/highlightGuidesButton");
                    }
                },
                guidesMouseLeave: function() {
                    var state = this.$store.getters["userovoSidebar/getGuidesButton"];
                    if (state !== 'selected' && state !== 'highlighted') {
                        this.$store.dispatch("userovoSidebar/deselectGuidesButton");
                    }
                },
                onClick: function(option) {
                    if (!option.noSelect) {
                        this.selectedMenuOptionLocal = option.name;
                        this.showMainMenu = true;
                        this.$store.dispatch("userovoSidebar/deselectGuidesButton");
                    }

                    if (option.name === "toggle") {
                        this.onToggleClick();
                    }
                    else if (option.name === "userovo-guides") {
                        this.$store.dispatch("userovoSidebar/selectGuidesButton");
                    }
                },
                onToggleClick: function() {
                    this.showMainMenu = !this.showMainMenu;
                },
                identifySelected: function() {
                    for (var ref in this.$refs) {
                        if (Array.isArray(this.$refs[ref])) {
                            for (var i = 0; i < this.$refs[ref].length; i++) {
                                if (this.$refs[ref][i].identifySelected) {
                                    this.$refs[ref][i].identifySelected();
                                }
                            }
                        }
                        else if (this.$refs[ref].identifySelected) {
                            this.$refs[ref].identifySelected();
                        }
                    }

                    this.setDefaultMenu();
                },
                setDefaultMenu: function() {
                    var selected = this.$store.getters["userovoSidebar/getSelectedMenuItem"];

                    if (!selected || !selected.menu) {
                        this.$store.dispatch("userovoSidebar/updateSelectedMenuItem", {menu: "analytics", item: {}});
                    }

                    if (selected && selected.menu && selected.menu === "dashboards") {
                        /**
                         * If the selected menu in vuex is dashboards, the sidebar should be floating.
                         */
                        this.showMainMenu = false;
                    }
                },
                onOptionsMenuMouseOver: function() {
                    this.onOptionsMenu = true;

                    var selectedOption = this.$store.getters["userovoSidebar/getSelectedMenuItem"];

                    if (selectedOption && selectedOption.menu === "dashboards" && !this.showMainMenu) {
                        this.showMainMenu = true;
                    }
                },
                onOptionsMenuMouseLeave: function() {
                    var self = this;
                    this.onOptionsMenu = false;
                    var selectedOption = this.$store.getters["userovoSidebar/getSelectedMenuItem"];

                    /**
                     * We don't want to run our side effect in this tick.
                     * We want to check if the user went over the main menu or not.
                     * If he went over it, onMainMenuMouseOver will be triggered either in this tick or next.
                     * In the next tick it will be clear to us whether the user went over the main menu or not.
                     * If it doesn't get triggered in the next two ticks,
                     * we can safely assume that the user is not over the main menu.
                     * And thus hide the main menu.
                     *
                     * We need this handler mainly for the case when the user moves away
                     * from the browser window. Basically the window is small and the user
                     * is moving outside of the window from the left side.
                     * Bcz if he goes to the right side, onMainMenu will be set to true,
                     * and the main menu will still be visible.
                     */
                    this.$nextTick(function() {
                        this.$nextTick(function() {
                            setTimeout(function() {
                                if (selectedOption && selectedOption.menu === "dashboards") {
                                    if (!self.onMainMenu && self.$refs.dashboards && self.$refs.dashboards[0] && !self.$refs.dashboards[0].hasOpenDrawer()) {
                                        0;
                                        /**
                                         * If not on the main menu, hide the main menu.
                                         */
                                        self.showMainMenu = false;
                                    }
                                }
                            }, 0);
                        });
                    });
                },
                onMainMenuMouseOver: function() {
                    this.onMainMenu = true;
                },
                onMainMenuMouseLeave: function() {
                    var self = this;
                    this.onMainMenu = false;
                    var selectedOption = this.$store.getters["userovoSidebar/getSelectedMenuItem"];

                    /**
                     * We don't want to run our side effect in this tick.
                     * We want to check if the user went over the options menu or not.
                     * If he went over it, onOptionsMenuMouseOver will be triggered either in this tick or next.
                     * In the next tick it will be clear to us whether the user went over the options menu or not.
                     * If it doesn't get triggered in the next two ticks,
                     * we can safely assume that the user is not over the options menu.
                     * And thus hide the main menu.
                     */
                    this.$nextTick(function() {
                        this.$nextTick(function() {
                            setTimeout(function() {
                                if (selectedOption && selectedOption.menu === "dashboards") {
                                    if (!self.onOptionsMenu && self.$refs.dashboards && self.$refs.dashboards[0] && !self.$refs.dashboards[0].hasOpenDrawer()) {
                                        /**
                                         * If not on the options menu, hide the main menu.
                                         */
                                        self.showMainMenu = false;
                                    }
                                }
                            }, 0);
                        });
                    });
                },
                onManagementMenuReady: function(items) {
                    this.defaultMainMenuOptions = this.defaultMainMenuOptions.map(function(menu) {
                        if (menu.name === "management") {
                            if (items.length) {
                                delete menu.hide;
                            }
                            else {
                                menu.hide = true;
                            }
                        }

                        return menu;
                    });
                },
                getFlexBannerUrl: function() {
                    let defaultFlexUrl = 'https://flex.userovo.com?utm_source=userovo_lite_banner'; //fallback

                    return new Promise((resolve) => {
                        try {
                            if (!window.Userovo) {
                                UserovoHelpers.notify({
                                    title: "Error",
                                    message: "Userovo SDK is not available",
                                    type: "error"
                                });
                                return resolve(defaultFlexUrl);
                            }

                            let UserovoSDK;
                            if (window.Userovo.present_feedback_widget) {
                                UserovoSDK = window.Userovo;
                            }
                            else {
                                UserovoSDK = window.Userovo.init({
                                    app_key: userovoGlobal.frontend_app,
                                    url: userovoGlobal.frontend_server,
                                    device_id: window.Userovo.device_id || window.location.hostname,
                                    remote_config: true
                                });
                            }

                            if (UserovoSDK.fetch_remote_config) {
                                UserovoSDK.fetch_remote_config(function(err, conf) {
                                    if (err) {
                                        resolve(defaultFlexUrl);
                                    }
                                    else {
                                        resolve(conf.flex_banner_url || defaultFlexUrl);
                                    }
                                });
                            }
                            else {
                                resolve(defaultFlexUrl);
                            }
                        }
                        catch {
                            resolve(defaultFlexUrl);
                        }
                    });
                },
                handleButtonClick: async function() {
                    const flexRedirectUrl = await this.getFlexBannerUrl();
                    UserovoHelpers.goTo({
                        url: flexRedirectUrl,
                        isExternalLink: true
                    });
                }
            },
            mounted: function() {
                var self = this;

                /**
                 * As per official vue documentation for mounted, its likely that refs are not
                 * available immediately. Therefore, they suggest to check for the refs
                 * in the nextTick.
                 *
                 * Following technique of checking refs is just a fullproof way of doing it.
                 */
                setTimeout(function() {
                    self.$nextTick(function() {
                        self.$nextTick(function() {
                            /**
                             * Check if the refs are available.
                             */
                            if (Object.keys(self.$refs).length) {
                                self.identifySelected();
                            }
                            else {
                                /**
                                 * This means that we don't have refs available yet.
                                 * Lets retry to check refs after a interval.
                                 * Clear the interval when the refs are found.
                                 */
                                var counter = 0;
                                var interval = setInterval(function() {
                                    if (counter > 10) {
                                        /**
                                         * Lets only check for the refs 10 times.
                                         * Bcz this could go on forever although not likely.
                                         * If refs are not found until then, the its likely
                                         * that there is some other issue.
                                         * After that lets clear the interval and return.
                                         */

                                        // eslint-disable-next-line no-console
                                        console.log("Refs not found in sidebar yet. Returning...");
                                        clearInterval(interval);
                                        return;
                                    }

                                    if (Object.keys(self.$refs).length) {
                                        self.identifySelected();
                                        clearInterval(interval);
                                    }

                                    counter++;
                                }, 50);
                            }
                        });
                    });
                }, 0);
            },
            created: function() {
                var self = this;
                if (this.enableGuides) {
                    userovoCMS.fetchEntry("server-guide-config").then(function(config) {
                        self.enableGuides = (config && config.data && config.data[0] && config.data[0].enableGuides) || false;
                    });
                    this.$store.dispatch("userovoSidebar/highlightGuidesButton", 'highlighted');
                }
            }
        });

        app.initSidebar = function() {
            userovoVue.sideBarComponent = new Vue({
                el: $('#sidebar-x').get(0),
                store: userovoVue.vuex.getGlobalStore(),
                components: {
                    Sidebar: SidebarView
                },
                template: '<Sidebar></Sidebar>'
            });
        };

        if (Object.keys(userovoGlobal.apps).length && !/initial-setup|initial-consent|not-responded-consent|not-subscribed-newsletter/.test(window.location.hash)) {
            app.initSidebar();
        }
    });

}(window.userovoVue = window.userovoVue || {}, jQuery));

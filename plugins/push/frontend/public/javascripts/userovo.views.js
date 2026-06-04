/* eslint-disable no-console */
/* global userovoVue,userovoPlugins,app,CV,userovoPushNotification,userovoPushNotificationComponent,UserovoHelpers,userovoCommon,userovoGlobal,userovoAuth,userovoGraphNotesCommon*/

(function() {

    var featureName = 'push';

    var statusFilterOptions = [
        {label: userovoPushNotification.service.ALL_FILTER_OPTION_LABEL, value: userovoPushNotification.service.ALL_FILTER_OPTION_VALUE},
        {label: CV.i18n("push-notification.created"), value: userovoPushNotification.service.StatusEnum.CREATED},
        {label: CV.i18n("push-notification.scheduled"), value: userovoPushNotification.service.StatusEnum.SCHEDULED},
        {label: CV.i18n("push-notification.sent"), value: userovoPushNotification.service.StatusEnum.SENT},
        {label: CV.i18n("push-notification.sending"), value: userovoPushNotification.service.StatusEnum.SENDING},
        {label: CV.i18n("push-notification.failed"), value: userovoPushNotification.service.StatusEnum.FAILED},
        {label: CV.i18n("push-notification.stopped"), value: userovoPushNotification.service.StatusEnum.STOPPED},
        {label: CV.i18n("push-notification.draft"), value: userovoPushNotification.service.StatusEnum.DRAFT},
        {label: CV.i18n("push-notification.waiting-for-approval"), value: userovoPushNotification.service.StatusEnum.PENDING_APPROVAL},
        {label: CV.i18n("push-notification.reject"), value: userovoPushNotification.service.StatusEnum.REJECT},
    ];

    var platformFilterOptions = [
        {label: CV.i18n("push-notification.platform-filter-all"), value: userovoPushNotification.service.PlatformEnum.ALL},
        {label: CV.i18n("push-notification.platform-filter-android"), value: userovoPushNotification.service.PlatformEnum.ANDROID},
        {label: CV.i18n("push-notification.platform-filter-ios"), value: userovoPushNotification.service.PlatformEnum.IOS}
    ];

    var oneTimePeriodFilterOptions = [
        {label: CV.i18n("push-notification.time-chart-period-weekly"), value: userovoPushNotification.service.PeriodEnum.WEEKLY},
        {label: CV.i18n("push-notification.time-chart-period-monthly"), value: userovoPushNotification.service.PeriodEnum.MONTHLY},
    ];
    var automaticPeriodFilterOptions = [{label: CV.i18n("push-notification.time-chart-period-daily"), value: userovoPushNotification.service.PeriodEnum.DAILY}];
    var transactionalPeriodFilterOptions = [{label: CV.i18n("push-notification.time-chart-period-daily"), value: userovoPushNotification.service.PeriodEnum.DAILY}];

    var messageTypeFilterOptions = [
        {label: CV.i18n("push-notification.content-message"), value: userovoPushNotification.service.MessageTypeEnum.CONTENT},
        {label: CV.i18n("push-notification.silent-message"), value: userovoPushNotification.service.MessageTypeEnum.SILENT}
    ];

    var InitialEnabledUsers = {
        ios: 0,
        android: 0,
        all: 0,
    };

    var InitialPushNotificationDrawerSettingsState = {
        ios: {
            isSubtitleEnabled: false,
            isMediaURLEnabled: false,
            isSoundFilenameEnabled: true,
            isBadgeNumberEnabled: false,
            isOnClickURLEnabled: false,
            isJsonEnabled: false,
            isUserDataEnabled: false,
            isContentAvailableSet: false,
        },
        android: {
            isMediaURLEnabled: false,
            isSoundFilenameEnabled: true,
            isBadgeNumberEnabled: false,
            isIconEnabled: false,
            isOnClickURLEnabled: false,
            isJsonEnabled: false,
            isUserDataEnabled: false,
        },
        all: {
            isMediaURLEnabled: false,
        }
    };

    var PushNotificationDrawer = userovoVue.views.create({
        template: CV.T("/push/templates/push-notification-drawer.html"),
        mixins: [userovoVue.mixins.i18n],
        props: {
            id: {
                type: String,
                default: null,
                required: false,
            },
            type: {
                type: String,
                default: userovoPushNotification.service.TypeEnum.ONE_TIME
            },
            userCommand: {
                type: String,
                default: userovoPushNotification.service.UserCommandEnum.CREATE,
            },
            controls: {
                type: Object
            },
            from: {
                type: String,
                default: null
            },
            queryFilter: {
                type: Object,
                default: null,
            },
        },
        data: function() {
            return {
                isFetchCohortsLoading: false,
                isFetchEventsLoading: false,
                isFetchLocationsLoading: false,
                isLoading: false,
                localizationOptions: [],
                userPropertiesOptions: [],
                cohortOptions: [],
                locationOptions: [],
                eventOptions: [],
                enabledUsers: JSON.parse(JSON.stringify(InitialEnabledUsers)),
                PlatformEnum: userovoPushNotification.service.PlatformEnum,
                TargetingEnum: userovoPushNotification.service.TargetingEnum,
                TypeEnum: userovoPushNotification.service.TypeEnum,
                MessageTypeEnum: userovoPushNotification.service.MessageTypeEnum,
                AudienceSelectionEnum: userovoPushNotification.service.AudienceSelectionEnum,
                SendEnum: userovoPushNotification.service.SendEnum,
                DeliveryMethodEnum: userovoPushNotification.service.DeliveryMethodEnum,
                TimezoneEnum: userovoPushNotification.service.TimezoneEnum,
                PastScheduleEnum: userovoPushNotification.service.PastScheduleEnum,
                TriggerEnum: userovoPushNotification.service.TriggerEnum,
                DeliveryDateCalculationEnum: userovoPushNotification.service.DeliveryDateCalculationEnum,
                TriggerNotMetEnum: userovoPushNotification.service.TriggerNotMetEnum,
                MediaTypeEnum: userovoPushNotification.service.MediaTypeEnum,
                UserCommandEnum: userovoPushNotification.service.UserCommandEnum,
                UserPropertyTypeEnum: userovoPushNotification.service.UserPropertyTypeEnum,
                messageTypeFilterOptions: messageTypeFilterOptions,
                startDateOptions: userovoPushNotification.service.startDateOptions,
                targetingOptions: userovoPushNotification.service.targetingOptions,
                audienceSelectionOptions: userovoPushNotification.service.audienceSelectionOptions,
                triggerOptions: userovoPushNotification.service.triggerOptions,
                triggerNotMetOptions: userovoPushNotification.service.triggerNotMetOptions,
                deliveryDateCalculationOptions: userovoPushNotification.service.deliveryDateCalculationOptions,
                deliveryMethodOptions: userovoPushNotification.service.deliveryMethodOptions,
                activeLocalization: userovoPushNotification.service.DEFAULT_LOCALIZATION_VALUE,
                selectedLocalizationFilter: userovoPushNotification.service.DEFAULT_LOCALIZATION_VALUE,
                isConfirmed: false,
                expandedPlatformSettings: [],
                settings: this.getInitialPushNotificationDrawerSettingsState(),
                userPropertiesIdCounter: 0,
                selectedUserPropertyId: null,
                isAddUserPropertyPopoverOpen: {
                    title: false,
                    content: false
                },
                isUsersTimezoneSet: false,
                isEndDateSet: false,
                isLocationSet: false,
                multipleLocalizations: false,
                urlRegex: new RegExp('([A-Za-z][A-Za-z0-9+\\-.]*):(?:(//)(?:((?:[A-Za-z0-9\\-._~!$&\'()*+,;=:]|%[0-9A-Fa-f]{2})*)@)?((?:\\[(?:(?:(?:(?:[0-9A-Fa-f]{1,4}:){6}|::(?:[0-9A-Fa-f]{1,4}:){5}|(?:[0-9A-Fa-f]{1,4})?::(?:[0-9A-Fa-f]{1,4}:){4}|(?:(?:[0-9A-Fa-f]{1,4}:){0,1}[0-9A-Fa-f]{1,4})?::(?:[0-9A-Fa-f]{1,4}:){3}|(?:(?:[0-9A-Fa-f]{1,4}:){0,2}[0-9A-Fa-f]{1,4})?::(?:[0-9A-Fa-f]{1,4}:){2}|(?:(?:[0-9A-Fa-f]{1,4}:){0,3}[0-9A-Fa-f]{1,4})?::[0-9A-Fa-f]{1,4}:|(?:(?:[0-9A-Fa-f]{1,4}:){0,4}[0-9A-Fa-f]{1,4})?::)(?:[0-9A-Fa-f]{1,4}:[0-9A-Fa-f]{1,4}|(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?))|(?:(?:[0-9A-Fa-f]{1,4}:){0,5}[0-9A-Fa-f]{1,4})?::[0-9A-Fa-f]{1,4}|(?:(?:[0-9A-Fa-f]{1,4}:){0,6}[0-9A-Fa-f]{1,4})?::)|[Vv][0-9A-Fa-f]+\\.[A-Za-z0-9\\-._~!$&\'()*+,;=:]+)\\]|(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)|(?:[A-Za-z0-9\\-._~!$&\'()*+,;=]|%[0-9A-Fa-f]{2})*))(?::([0-9]*))?((?:/(?:[A-Za-z0-9\\-._~!$&\'()*+,;=:@]|%[0-9A-Fa-f]{2})*)*)|/((?:(?:[A-Za-z0-9\\-._~!$&\'()*+,;=:@]|%[0-9A-Fa-f]{2})+(?:/(?:[A-Za-z0-9\\-._~!$&\'()*+,;=:@]|%[0-9A-Fa-f]{2})*)*)?)|((?:[A-Za-z0-9\\-._~!$&\'()*+,;=:@]|%[0-9A-Fa-f]{2})+(?:/(?:[A-Za-z0-9\\-._~!$&\'()*+,;=:@]|%[0-9A-Fa-f]{2})*)*)|)(?:\\?((?:[A-Za-z0-9\\-._~!$&\'()*+,;=:@/?]|%[0-9A-Fa-f]{2})*))?(?:\\#((?:[A-Za-z0-9\\-._~!$&\'()*+,;=:@/?]|%[0-9A-Fa-f]{2})*))?'),
                pushNotificationUnderEdit: JSON.parse(JSON.stringify(userovoPushNotification.helper.getInitialModel(this.type))),
                currentNumberOfUsers: 0,
                today: Date.now(),
                appConfig: {},
            };
        },
        watch: {
            type: function() {
                this.pushNotificationUnderEdit = JSON.parse(JSON.stringify(userovoPushNotification.helper.getInitialModel(this.type)));
            }
        },
        computed: {
            startDate: {
                get: function() {
                    if (this.pushNotificationUnderEdit.delivery.startDate) {
                        return this.pushNotificationUnderEdit.delivery.startDate;
                    }
                    return this.today;
                },
                set: function(value) {
                    this.pushNotificationUnderEdit.delivery.startDate = value;
                }
            },
            endDate: {
                get: function() {
                    if (this.pushNotificationUnderEdit.delivery.endDate) {
                        return this.pushNotificationUnderEdit.delivery.endDate;
                    }
                    return this.today;
                },
                set: function(value) {
                    this.pushNotificationUnderEdit.delivery.endDate = value;
                }
            },
            usersTimezone: {
                get: function() {
                    if (this.pushNotificationUnderEdit.automatic.usersTimezone) {
                        return this.pushNotificationUnderEdit.automatic.usersTimezone;
                    }
                    return this.today;
                },
                set: function(value) {
                    this.pushNotificationUnderEdit.automatic.usersTimezone = value;
                }
            },
            saveButtonLabel: function() {
                if (!userovoPushNotification.service.isPushNotificationApproverPluginEnabled()) {
                    return CV.i18n('push-notification.save');
                }
                if (userovoPushNotification.service.hasApproverBypassPermission()) {
                    return CV.i18n('push-notification.save');
                }
                return CV.i18n('push-notification.send-for-approval');
            },
            title: function() {
                if (this.type === userovoPushNotification.service.TypeEnum.ONE_TIME) {
                    return CV.i18n('push-notification.create-one-time-notification');
                }
                if (this.type === userovoPushNotification.service.TypeEnum.AUTOMATIC) {
                    return CV.i18n('push-notification.create-automated-notification');
                }
                if (this.type === userovoPushNotification.service.TypeEnum.TRANSACTIONAL) {
                    return CV.i18n('push-notification.create-transactional-notification');
                }
            },
            addButtonLabel: function() {
                if (this.pushNotificationUnderEdit.message[this.activeLocalization].buttons.length === 0) {
                    return CV.i18n('push-notification.add-first-button');
                }
                return CV.i18n('push-notification.add-second-button');
            },
            isDraftButtonEnabled: function() {
                return this.userCommand === this.UserCommandEnum.EDIT_DRAFT ||
                this.userCommand === this.UserCommandEnum.CREATE ||
                this.userCommand === this.UserCommandEnum.DUPLICATE;
            },
            isDefaultLocalizationActive: function() {
                return this.activeLocalization === userovoPushNotification.service.DEFAULT_LOCALIZATION_VALUE;
            },
            isAddButtonDisabled: function() {
                return this.pushNotificationUnderEdit.message[this.activeLocalization].buttons.length === 2;
            },
            selectedLocalizationFilterOptions: function() {
                return this.pushNotificationUnderEdit.localizations;
            },
            selectedLocalizationMessage: function() {
                return this.pushNotificationUnderEdit.message[this.selectedLocalizationFilter];
            },
            totalEnabledUsers: function() {
                var self = this;
                if (this.pushNotificationUnderEdit.platforms.some(function(item) {
                    return item === self.PlatformEnum.ANDROID;
                }) &&
                this.pushNotificationUnderEdit.platforms.some(function(item) {
                    return item === self.PlatformEnum.IOS;
                })) {
                    return this.enabledUsers[this.PlatformEnum.ALL];
                }
                if (this.pushNotificationUnderEdit.platforms.some(function(selectedPlatform) {
                    return selectedPlatform === self.PlatformEnum.ANDROID;
                })) {
                    return this.enabledUsers[this.PlatformEnum.ANDROID];
                }
                if (this.pushNotificationUnderEdit.platforms.some(function(selectedPlatform) {
                    return selectedPlatform === self.PlatformEnum.IOS;
                })) {
                    return this.enabledUsers[this.PlatformEnum.IOS];
                }
                return 0;
            },
            selectedMessageLocale: function() {
                return this.pushNotificationUnderEdit.message[this.activeLocalization];
            },
            areCohortsAndLocationsRequired: function() {
                return !this.pushNotificationUnderEdit.cohorts.length && !this.pushNotificationUnderEdit.locations.length;
            },
            hasAllPlatformMediaOnly: function() {
                return (!this.pushNotificationUnderEdit.settings[this.PlatformEnum.IOS].mediaURL &&
                !this.pushNotificationUnderEdit.settings[this.PlatformEnum.ANDROID].mediaURL) ||
                (!this.settings[this.PlatformEnum.IOS].isMediaURLEnabled &&
                !this.settings[this.PlatformEnum.ANDROID].isMediaURLEnabled);
            },
            previewIOSMediaURL: function() {
                var result = "";
                if (this.pushNotificationUnderEdit.settings[this.PlatformEnum.ALL].mediaURL) {
                    result = this.pushNotificationUnderEdit.settings[this.PlatformEnum.ALL].mediaURL;
                }
                if (this.pushNotificationUnderEdit.settings[this.PlatformEnum.IOS].mediaURL && this.settings[this.PlatformEnum.IOS].isMediaURLEnabled) {
                    result = this.pushNotificationUnderEdit.settings[this.PlatformEnum.IOS].mediaURL;
                }
                return result;
            },
            previewAndroidMediaURL: function() {
                var result = "";
                if (this.pushNotificationUnderEdit.settings[this.PlatformEnum.ALL].mediaURL) {
                    result = this.pushNotificationUnderEdit.settings[this.PlatformEnum.ALL].mediaURL;
                }
                if (this.pushNotificationUnderEdit.settings[this.PlatformEnum.ANDROID].mediaURL && this.settings[this.PlatformEnum.ANDROID].isMediaURLEnabled) {
                    result = this.pushNotificationUnderEdit.settings[this.PlatformEnum.ANDROID].mediaURL;
                }
                return result;
            },
            previewMessageMedia: function() {
                var result = {};
                result[this.PlatformEnum.ALL] = {url: this.pushNotificationUnderEdit.settings[this.PlatformEnum.ALL].mediaURL, type: this.pushNotificationUnderEdit.settings[this.PlatformEnum.ALL].mediaMime };
                result[this.PlatformEnum.IOS] = {url: this.pushNotificationUnderEdit.settings[this.PlatformEnum.IOS].mediaURL, type: this.pushNotificationUnderEdit.settings[this.PlatformEnum.IOS].mediaMime };
                result[this.PlatformEnum.ANDROID] = {url: this.pushNotificationUnderEdit.settings[this.PlatformEnum.ANDROID].mediaURL, type: this.pushNotificationUnderEdit.settings[this.PlatformEnum.ANDROID].mediaMime};
                return result;
            },
            previewMessageTitle: function() {
                return userovoPushNotification.helper.getPreviewMessageComponentsList(this.pushNotificationUnderEdit.message[this.selectedLocalizationFilter].title);
            },
            previewMessageContent: function() {
                return userovoPushNotification.helper.getPreviewMessageComponentsList(this.pushNotificationUnderEdit.message[this.selectedLocalizationFilter].content);
            },
            shouldDisplayIOSSettings: function() {
                return this.shouldDisplayPlatformSettings(this.PlatformEnum.IOS);
            },
            shouldDisplayAndroidSettings: function() {
                return this.shouldDisplayPlatformSettings(this.PlatformEnum.ANDROID);
            },
            shouldDisplayNumberOfUsers: function() {
                if (this.pushNotificationUnderEdit.type === this.TypeEnum.ONE_TIME || this.type === this.TypeEnum.ONE_TIME) {
                    return this.pushNotificationUnderEdit[this.TypeEnum.ONE_TIME].audienceSelection === this.AudienceSelectionEnum.NOW;
                }
                return true;
            },
            previewPlatforms: function() {
                return this.pushNotificationUnderEdit.platforms.map(function(selectedPlatform) {
                    return userovoPushNotification.service.platformOptions[selectedPlatform].label;
                });
            },
            previewLocations: function() {
                var self = this;
                return this.locationOptions.reduce(function(allLocations, currentLocation) {
                    if (self.pushNotificationUnderEdit.locations.some(function(selectedLocationId) {
                        return currentLocation._id === selectedLocationId;
                    })) {
                        allLocations.push(currentLocation.name);
                    }
                    return allLocations;
                }, []);
            }
        },
        methods: {
            getInitialPushNotificationDrawerSettingsState: function() {
                const _InitialPushNotificationDrawerSettingsState = JSON.parse(JSON.stringify(InitialPushNotificationDrawerSettingsState));
                const settings = userovoPlugins.getConfigsData();
                if (settings.push && settings.push.default_content_available) {
                    _InitialPushNotificationDrawerSettingsState.ios.isContentAvailableSet = true;
                }
                return _InitialPushNotificationDrawerSettingsState;
            },
            previewCohorts: function(cohorts) {
                var selectedCohorts = this.cohortOptions.filter(function(cohort) {
                    return cohorts.some(function(selectedCohortId) {
                        return cohort._id === selectedCohortId;
                    });
                });
                return selectedCohorts.map(function(cohort) {
                    return cohort.name.replace(/&quot;/g, '\\"');
                });
            },
            formatDateTime: function(dateTime, format) {
                return userovoPushNotification.helper.formatDateTime(dateTime, format);
            },
            setUserPropertyOptions: function(propertyList) {
                var allPropertyOptions = [];
                if (this.type === this.TypeEnum.AUTOMATIC && this.pushNotificationUnderEdit.automatic.trigger === this.TriggerEnum.EVENT) {
                    allPropertyOptions.push({label: CV.i18n('push-notification.event-properties'), name: "eventProperties", options: userovoPushNotification.helper.getEventPropertyOptions(propertyList)});
                }
                allPropertyOptions.push({label: CV.i18n('push-notification.user-properties'), name: "userProperties", options: userovoPushNotification.helper.getUserPropertyOptions(propertyList)});
                allPropertyOptions.push({label: CV.i18n('push-notification.custom-properties'), name: "customProperties", options: userovoPushNotification.helper.getCustomPropertyOptions(propertyList)});
                this.userPropertiesOptions = allPropertyOptions;
            },
            fetchUserPropertyOptions: function() {
                var self = this;
                userovoPushNotification.service.fetchUserProperties().then(function(result) {
                    self.setUserPropertyOptions(result);
                });
            },
            isDeliveryNextStepFromInfoStep: function(nextStep, currentStep) {
                return nextStep === 1 && currentStep === 0;
            },
            isReviewNextStepFromContentStep: function(nextStep, currentStep) {
                return nextStep === 3 && currentStep === 2;
            },
            isContentNextStepFromInfoStep: function(nextStep, currentStep) {
                return nextStep === 2 && currentStep === 0;
            },
            isContentNextStepFromAnyPreviousStep: function(nextStep, currentStep) {
                return nextStep === 2 && currentStep < 2;
            },
            isEditMode: function() {
                return this.userCommand === this.UserCommandEnum.DUPLICATE ||
                this.userCommand === this.UserCommandEnum.EDIT_DRAFT ||
                this.userCommand === this.UserCommandEnum.EDIT ||
                this.userCommand === this.UserCommandEnum.RESEND;
            },
            shouldEstimate: function(nextStep, currentStep) {
                return this.isDeliveryNextStepFromInfoStep(nextStep, currentStep) || this.isContentNextStepFromInfoStep(nextStep, currentStep);
            },
            shouldValidateContentOnEnter: function(nextStep, currentStep) {
                return (this.isContentNextStepFromAnyPreviousStep(nextStep, currentStep) && this.isEditMode());
            },
            shouldValidateContentBeforeExit: function(nextStep, currentStep) {
                return this.isReviewNextStepFromContentStep(nextStep, currentStep) && this.pushNotificationUnderEdit.messageType === this.MessageTypeEnum.CONTENT;
            },
            validateContentOnEnterIfNecessary: function(nextStep, currentStep) {
                if (this.shouldValidateContentOnEnter(nextStep, currentStep)) {
                    this.$refs.content.validate();
                }
            },
            fetchUserPropertyOptionsOnContentEnter: function(nextStep, currentStep) {
                if (this.isContentNextStepFromAnyPreviousStep(nextStep, currentStep)) {
                    this.fetchUserPropertyOptions();
                }
            },
            onStepClick: function(nextStep, currentStep) {
                this.validateContentOnEnterIfNecessary(nextStep, currentStep);
                this.fetchUserPropertyOptionsOnContentEnter(nextStep, currentStep);
                if (this.shouldEstimate(nextStep, currentStep)) {
                    return this.estimate();
                }
                if (this.shouldValidateContentBeforeExit(nextStep, currentStep)) {
                    return this.$refs.content.validate();
                }
                return Promise.resolve(true);
            },
            setId: function(id) {
                this.pushNotificationUnderEdit._id = id;
            },
            setCurrentNumberOfUsers: function(value) {
                this.currentNumberOfUsers = value;
            },
            updateEnabledNumberOfUsers: function(value) {
                var self = this;
                if (this.pushNotificationUnderEdit.platforms.some(function(item) {
                    return item === self.PlatformEnum.ANDROID;
                }) &&
                this.pushNotificationUnderEdit.platforms.some(function(item) {
                    return item === self.PlatformEnum.IOS;
                })) {
                    this.enabledUsers[this.PlatformEnum.ALL] = value;
                    return;
                }
                if (this.pushNotificationUnderEdit.platforms.some(function(item) {
                    return item === self.PlatformEnum.ANDROID;
                })) {
                    this.enabledUsers[this.PlatformEnum.ANDROID] = value;
                    this.enabledUsers[this.PlatformEnum.IOS] = 0;
                    return;
                }
                if (this.pushNotificationUnderEdit.platforms.some(function(item) {
                    return item === self.PlatformEnum.IOS;
                })) {
                    this.enabledUsers[this.PlatformEnum.IOS] = value;
                    this.enabledUsers[this.PlatformEnum.ANDROID] = 0;
                    return;
                }
            },
            setLocalizationOptions: function(localizations) {
                this.localizationOptions = localizations;
            },
            setIsLoading: function(value) {
                this.isLoading = value;
            },
            getQueryFilter: function() {
                if (!this.queryFilter) {
                    return {};
                }
                return this.queryFilter;
            },
            estimate: function() {
                var self = this;
                return new Promise(function(resolve) {
                    if (!self.pushNotificationUnderEdit.platforms.length) {
                        resolve(false);
                        return;
                    }
                    self.setIsLoading(true);
                    var options = {};
                    options.isLocationSet = self.isLocationSet;
                    options.from = self.from;
                    options.queryFilter = self.getQueryFilter();
                    var preparePushNotificationModel = Object.assign({}, self.pushNotificationUnderEdit);
                    preparePushNotificationModel.type = self.type;
                    userovoPushNotification.service.estimate(preparePushNotificationModel, options).then(function(response) {
                        if (response._id) {
                            self.setId(response._id);
                        }
                        self.setLocalizationOptions(response.localizations);
                        self.setCurrentNumberOfUsers(response.total);
                        if (self.pushNotificationUnderEdit.type === self.TypeEnum.ONE_TIME || self.type === self.TypeEnum.ONE_TIME) {
                            if (self.pushNotificationUnderEdit[self.TypeEnum.ONE_TIME].targeting === self.TargetingEnum.ALL) {
                                self.updateEnabledNumberOfUsers(response.total);
                            }
                        }
                        if (self.type === self.TypeEnum.ONE_TIME && self.pushNotificationUnderEdit[self.TypeEnum.ONE_TIME].audienceSelection === self.AudienceSelectionEnum.BEFORE) {
                            resolve(true);
                            return;
                        }
                        if (response.total === 0) {
                            resolve(false);
                            UserovoHelpers.notify({ message: 'No users were found from selected configuration.', type: "error"});
                            return;
                        }
                        resolve(true);
                    }).catch(function(error) {
                        console.error(error);
                        self.setLocalizationOptions([]);
                        self.setCurrentNumberOfUsers(0);
                        self.updateEnabledNumberOfUsers(0);
                        UserovoHelpers.notify({ message: error.message, type: "error"});
                        resolve(false);
                    }).finally(function() {
                        self.setIsLoading(false);
                    });
                });
            },
            getBaseOptions: function() {
                var options = {};
                options.localizations = this.localizationOptions;
                options.settings = this.settings;
                options.isUsersTimezoneSet = this.isUsersTimezoneSet;
                options.isEndDateSet = this.isEndDateSet;
                options.isLocationSet = this.isLocationSet;
                options.from = this.from;
                options.queryFilter = this.getQueryFilter();
                return options;
            },
            save: function(options) {
                if (!options) {
                    options = {};
                }
                options = Object.assign(options, this.getBaseOptions());
                var model = Object.assign({}, this.pushNotificationUnderEdit);
                model.type = this.type;
                return userovoPushNotification.service.save(model, options);
            },
            sendToTestUsers: function(options) {
                if (!options) {
                    options = {};
                }
                options = Object.assign(options, this.getBaseOptions());
                var model = Object.assign({}, this.pushNotificationUnderEdit);
                model.type = this.type;
                return userovoPushNotification.service.sendToTestUsers(model, options);
            },
            update: function(options) {
                if (!options) {
                    options = {};
                }
                options = Object.assign(options, this.getBaseOptions());
                var model = Object.assign({}, this.pushNotificationUnderEdit);
                model.type = this.type;
                return userovoPushNotification.service.update(model, options);
            },
            resend: function(options) {
                if (!options) {
                    options = {};
                }
                options = Object.assign(options, this.getBaseOptions());
                var model = Object.assign({}, this.pushNotificationUnderEdit);
                model.type = this.type;
                return userovoPushNotification.service.resend(model, options);
            },
            saveDraft: function() {
                var options = {};
                options.isDraft = true;
                options.isCreated = false;
                return this.save(options);
            },
            updateDraft: function() {
                var options = {};
                options.isDraft = true;
                options.isCreated = false;
                return this.update(options);
            },
            saveFromDraft: function() {
                var options = {};
                options.isDraft = true;
                options.isCreated = true;
                return this.update(options);
            },
            onDraft: function() {
                var self = this;
                var promiseMethod = null;
                if (this.userCommand === this.UserCommandEnum.EDIT_DRAFT) {
                    promiseMethod = this.updateDraft;
                }
                if (this.userCommand === this.UserCommandEnum.CREATE) {
                    promiseMethod = this.saveDraft;
                }
                if (this.userCommand === this.UserCommandEnum.DUPLICATE) {
                    promiseMethod = this.saveDraft;
                }
                if (!promiseMethod) {
                    throw new Error('Invalid user command:' + this.userCommand);
                }
                promiseMethod().then(function() {
                    self.$refs.drawer.doClose();
                    UserovoHelpers.notify({message: CV.i18n('push-notification.was-successfully-saved')});
                    self.$emit('save');
                }).catch(function(error) {
                    console.error(error);
                    UserovoHelpers.notify({message: error.message, type: "error"});
                });
            },
            onSubmit: function(_, done) {
                var self = this;
                var promiseMethod = null;
                if (this.userCommand === this.UserCommandEnum.EDIT_DRAFT) {
                    promiseMethod = this.saveFromDraft;
                }
                if (this.userCommand === this.UserCommandEnum.EDIT) {
                    promiseMethod = this.update;
                }
                if (this.userCommand === this.UserCommandEnum.EDIT_REJECT) {
                    promiseMethod = this.saveFromDraft;
                }
                if (this.userCommand === this.UserCommandEnum.CREATE) {
                    promiseMethod = this.save;
                }
                if (this.userCommand === this.UserCommandEnum.DUPLICATE) {
                    promiseMethod = this.save;
                }
                if (this.userCommand === this.UserCommandEnum.RESEND) {
                    promiseMethod = this.resend;
                }
                if (!promiseMethod) {
                    throw new Error('Invalid user command:' + this.userCommand);
                }
                promiseMethod().then(function() {
                    done();
                    UserovoHelpers.notify({ message: CV.i18n('push-notification.was-successfully-saved')});
                    self.$emit('save');
                }).catch(function(error) {
                    console.error(error);
                    UserovoHelpers.notify({ message: error.message, type: "error"});
                    done(true);
                });
            },
            onSendToTestUsers: function() {
                var self = this;
                this.isLoading = true;
                this.sendToTestUsers().then(function() {
                    UserovoHelpers.notify({message: CV.i18n('push-notification.was-successfully-sent-to-test-users')});
                }).catch(function(error) {
                    console.error(error);
                    UserovoHelpers.notify({ message: error.message, type: "error"});
                }).finally(function() {
                    self.isLoading = false;
                });
            },
            resetState: function() {
                this.activeLocalization = userovoPushNotification.service.DEFAULT_LOCALIZATION_VALUE;
                this.selectedLocalizationFilter = userovoPushNotification.service.DEFAULT_LOCALIZATION_VALUE;
                this.isUsersTimezoneSet = false;
                this.isEndDateSet = false;
                this.isLocationSet = false;
                this.isConfirmed = false;
                this.multipleLocalizations = false;
                this.expandedPlatformSettings = [];
                this.isAddUserPropertyPopoverOpen = {
                    title: false,
                    content: false
                };
                this.settings = this.getInitialPushNotificationDrawerSettingsState();
                this.pushNotificationUnderEdit = JSON.parse(JSON.stringify(userovoPushNotification.helper.getInitialModel(this.type)));
            },
            onClose: function() {
                this.resetState();
                this.$emit('onClose');
            },
            hasPlatformConfig: function(platform) {
                if (platform === this.PlatformEnum.ANDROID) {
                    return (this.appConfig[platform] && this.appConfig[platform]._id) || (this.appConfig[this.PlatformEnum.HUAWEI] && this.appConfig[this.PlatformEnum.HUAWEI]._id);
                }
                return this.appConfig[platform] && this.appConfig[platform]._id;
            },
            getPlatformLabel: function(platform) {
                if (platform === this.PlatformEnum.ANDROID) {
                    return CV.i18n('push-notification.android');
                }
                if (platform === this.PlatformEnum.IOS) {
                    return CV.i18n('push-notification.ios');
                }
                return platform;
            },
            hasAnyFilters: function() {
                return this.pushNotificationUnderEdit.user || this.pushNotificationUnderEdit.drill;
            },
            estimateIfNecessary: function() {
                if (this.pushNotificationUnderEdit.type === this.TypeEnum.ONE_TIME || this.type === this.TypeEnum.ONE_TIME) {
                    if (this.from) {
                        this.estimate();
                        return;
                    }
                    if (this.hasAnyFilters()) {
                        this.estimate();
                        return;
                    }
                }
            },
            onPlatformChange: function(platform) {
                if (!this.isPlatformSelected(platform)) {
                    if (this.hasPlatformConfig(platform)) {
                        this.pushNotificationUnderEdit.platforms.push(platform);
                        this.estimateIfNecessary();
                        return;
                    }
                    UserovoHelpers.notify({type: 'error', message: CV.i18n('push-notification.no-credentials', this.getPlatformLabel(platform)) || ('No push credentials found for ' + this.getPlatformLabel(platform) + ' platform') });
                }
                else {
                    this.pushNotificationUnderEdit.platforms = this.pushNotificationUnderEdit.platforms.filter(function(item) {
                        return item !== platform;
                    });
                    this.estimateIfNecessary();
                }
            },
            isPlatformSelected: function(platform) {
                return this.pushNotificationUnderEdit.platforms.some(function(item) {
                    return item === platform;
                });
            },
            updatePlatformsBasedOnAppConfig: function() {
                if (this.hasPlatformConfig(this.PlatformEnum.ANDROID)) {
                    this.pushNotificationUnderEdit.platforms.push(this.PlatformEnum.ANDROID);
                }
                if (this.hasPlatformConfig(this.PlatformEnum.IOS)) {
                    this.pushNotificationUnderEdit.platforms.push(this.PlatformEnum.IOS);
                }
            },
            isQueryFilterEmpty: function() {
                return this.queryFilter && this.queryFilter.queryObject && Object.keys(this.queryFilter.queryObject).length === 0;
            },
            onOpen: function() {
                if (this.id) {
                    this.fetchPushNotificationById();
                    return;
                }
                this.updatePlatformsBasedOnAppConfig();
                this.estimateIfNecessary();

                if (this.$store.state.userovoPushNotificationDashboard) {
                    this.setEnabledUsers(this.$store.state.userovoPushNotificationDashboard.enabledUsers);
                }
                else {
                    var self = this;

                    userovoPushNotification.service.fetchDashboard()
                        .then(function(response) {
                            self.setEnabledUsers(response.enabledUsers);
                        })
                        .catch(function(error) {
                            console.error(error);
                        });
                }
            },
            addButton: function() {
                this.pushNotificationUnderEdit.message[this.activeLocalization].buttons.push({label: "", url: ""});
            },
            removeButton: function(index) {
                var filteredButtons = this.pushNotificationUnderEdit.message[this.activeLocalization].buttons.filter(function(buttonItem, buttonIndex) {
                    return buttonIndex !== index;
                });
                this.pushNotificationUnderEdit.message[this.activeLocalization].buttons = filteredButtons;
            },
            removeAllNonDefaultSelectedLocalizations: function() {
                this.pushNotificationUnderEdit.localizations = this.pushNotificationUnderEdit.localizations.filter(function(selectedLocalization) {
                    return selectedLocalization.value === userovoPushNotification.service.DEFAULT_LOCALIZATION_VALUE;
                });
            },
            deleteAllNonDefaultLocalizationMessages: function() {
                var self = this;
                Object.keys(this.pushNotificationUnderEdit.message).forEach(function(key) {
                    if (key && key !== userovoPushNotification.service.DEFAULT_LOCALIZATION_VALUE) {
                        self.$delete(self.pushNotificationUnderEdit.message, key);
                    }
                });
            },
            expandPlatformSettingsIfSilentMessage: function() {
                if (this.pushNotificationUnderEdit.messageType === this.MessageTypeEnum.SILENT) {
                    this.expandedPlatformSettings = [].concat(this.pushNotificationUnderEdit.platforms);
                }
            },
            onMessageTypeChange: function(value) {
                this.pushNotificationUnderEdit.messageType = value;
                this.expandPlatformSettingsIfSilentMessage();
            },
            onMultipleLocalizationChange: function(isChecked) {
                this.multipleLocalizations = isChecked;
                if (!isChecked) {
                    this.setActiveLocalization(userovoPushNotification.service.DEFAULT_LOCALIZATION_VALUE);
                    this.resetMessageInHTMLToActiveLocalization();
                    this.deleteAllNonDefaultLocalizationMessages();
                    this.removeAllNonDefaultSelectedLocalizations();
                }
            },
            isDefaultLocalization: function(item) {
                return item.value === userovoPushNotification.service.DEFAULT_LOCALIZATION_VALUE;
            },
            isLocalizationSelected: function(item) {
                return this.pushNotificationUnderEdit.localizations.filter(function(selectedLocalization) {
                    return item.value === selectedLocalization.value;
                }).length > 0;
            },
            addEmptyLocalizationMessageIfNotFound: function(localization) {
                var value = localization.value;
                if (!this.pushNotificationUnderEdit.message[value]) {
                    this.$set(this.pushNotificationUnderEdit.message, value, {
                        title: "",
                        content: "",
                        buttons: [],
                        properties: {
                            title: {},
                            content: {}
                        }
                    });
                }
            },
            addLocalizationIfNotSelected: function(item) {
                if (!this.isLocalizationSelected(item)) {
                    this.pushNotificationUnderEdit.localizations.push(item);
                }
            },
            setActiveLocalization: function(value) {
                this.activeLocalization = value;
            },
            removeLocalization: function(item) {
                this.pushNotificationUnderEdit.localizations = this.pushNotificationUnderEdit.localizations.filter(function(selectedLocalization) {
                    return item.value !== selectedLocalization.value;
                });
            },
            resetMessageInHTMLToActiveLocalization: function() {
                this.$refs.title.reset(
                    this.pushNotificationUnderEdit.message[this.activeLocalization].title,
                    Object.keys(this.pushNotificationUnderEdit.message[this.activeLocalization].properties.title)
                );
                this.$refs.content.reset(
                    this.pushNotificationUnderEdit.message[this.activeLocalization].content,
                    Object.keys(this.pushNotificationUnderEdit.message[this.activeLocalization].properties.content)
                );
            },
            onLocalizationChange: function(localization) {
                if (!this.isLocalizationSelected(localization)) {
                    this.addEmptyLocalizationMessageIfNotFound(localization);
                    this.addLocalizationIfNotSelected(localization);
                    this.setActiveLocalization(localization.value);
                    this.resetMessageInHTMLToActiveLocalization();
                }
                else {
                    this.removeLocalization(localization);
                    this.setActiveLocalization(userovoPushNotification.service.DEFAULT_LOCALIZATION_VALUE);
                    this.resetMessageInHTMLToActiveLocalization();
                }
            },
            onLocalizationSelect: function(localization) {
                this.addEmptyLocalizationMessageIfNotFound(localization);
                this.setActiveLocalization(localization.value);
                this.resetMessageInHTMLToActiveLocalization();
            },
            onSettingChange: function(platform, property, value) {
                this.pushNotificationUnderEdit.settings[platform][property] = value;
            },
            onSettingToggle: function(platform, property, value) {
                this.settings[platform][property] = value;
            },
            prettifyJSON: function(value) {
                return userovoPushNotification.helper.prettifyJSON(value, 2);
            },
            onTitleChange: function(value) {
                this.pushNotificationUnderEdit.message[this.activeLocalization].title = value;
            },
            onContentChange: function(value) {
                this.pushNotificationUnderEdit.message[this.activeLocalization].content = value;
            },
            setSelectedUserPropertyId: function(id) {
                this.selectedUserPropertyId = id;
            },
            openAddUserPropertyPopover: function(container) {
                this.isAddUserPropertyPopoverOpen[container] = true;
            },
            closeAddUserPropertyPopover: function(container) {
                this.isAddUserPropertyPopoverOpen[container] = false;
            },
            addUserPropertyInHTML: function(id, container) {
                this.$refs[container].addEmptyUserProperty(id);
            },
            removeUserPropertyInHTML: function(id, container) {
                this.$refs[container].removeUserProperty(id);
            },
            setUserPropertyInHTML: function(id, container, previewValue, value, type) {
                this.$refs[container].setUserPropertyValue(id, previewValue, value, type);
            },
            setUserPropertyFallbackInHTML: function(id, container, previewValue, fallback) {
                this.$refs[container].setUserPropertyFallbackValue(id, previewValue, fallback);
            },
            isAnyAddUserPropertyPopoverOpen: function() {
                return this.isAddUserPropertyPopoverOpen.title || this.isAddUserPropertyPopoverOpen.content;
            },
            onAddUserProperty: function(container) {
                if (!this.isAnyAddUserPropertyPopoverOpen()) {
                    var propertyIndex = this.userPropertiesIdCounter;
                    this.userPropertiesIdCounter = this.userPropertiesIdCounter + 1;
                    this.$set(this.pushNotificationUnderEdit.message[this.activeLocalization].properties[container], propertyIndex, {
                        id: propertyIndex,
                        value: "",
                        type: this.UserPropertyTypeEnum.USER,
                        label: "Select property|",
                        fallback: "",
                        isUppercase: false
                    });
                    this.setSelectedUserPropertyId(propertyIndex);
                    this.addUserPropertyInHTML(propertyIndex, container);
                }
            },
            onRemoveUserProperty: function(payload) {
                var id = payload.id;
                var container = payload.container;
                this.closeAddUserPropertyPopover(payload.container);
                this.$delete(this.pushNotificationUnderEdit.message[this.activeLocalization].properties[container], id);
                this.removeUserPropertyInHTML(id, container);
            },
            onSelectUserProperty: function(payload) {
                var id = payload.id;
                var container = payload.container;
                var value = payload.value;
                var label = payload.label;
                var type = payload.type;
                this.pushNotificationUnderEdit.message[this.activeLocalization].properties[container][id].value = value;
                this.pushNotificationUnderEdit.message[this.activeLocalization].properties[container][id].label = label;
                this.pushNotificationUnderEdit.message[this.activeLocalization].properties[container][id].type = type;
                var currentFallbackValue = this.pushNotificationUnderEdit.message[this.activeLocalization].properties[container][id].fallback;
                var previewValue = label + "|" + currentFallbackValue;
                this.setUserPropertyInHTML(id, container, previewValue, value, type);
            },
            onInputUserProperty: function(payload) {
                var id = payload.id;
                var container = payload.container;
                var value = payload.value;
                var label = payload.value;
                var type = this.UserPropertyTypeEnum.API;
                this.pushNotificationUnderEdit.message[this.activeLocalization].properties[container][id].value = value;
                this.pushNotificationUnderEdit.message[this.activeLocalization].properties[container][id].label = label;
                this.pushNotificationUnderEdit.message[this.activeLocalization].properties[container][id].type = type;
                var currentFallbackValue = this.pushNotificationUnderEdit.message[this.activeLocalization].properties[container][id].fallback;
                var previewValue = "{" + value + "}|" + currentFallbackValue;
                this.setUserPropertyInHTML(id, container, previewValue, value, type);
            },
            onInputFallbackUserProperty: function(payload) {
                var id = payload.id;
                var container = payload.container;
                var fallback = payload.value;
                this.pushNotificationUnderEdit.message[this.activeLocalization].properties[container][id].fallback = fallback;
                var currentLabel = this.pushNotificationUnderEdit.message[this.activeLocalization].properties[container][id].label;
                var previewValue = currentLabel + "|" + fallback;
                this.setUserPropertyFallbackInHTML(id, container, previewValue, fallback);
            },
            onCheckUppercaseUserProperty: function(payload) {
                var id = payload.id;
                var container = payload.container;
                var isUppercase = payload.value;
                this.pushNotificationUnderEdit.message[this.activeLocalization].properties[container][id].isUppercase = isUppercase;
            },
            onUserPropertyClick: function(payload) {
                if (!this.isAnyAddUserPropertyPopoverOpen()) {
                    this.setSelectedUserPropertyId(payload.id);
                    this.openAddUserPropertyPopover(payload.container);
                }
            },
            resetAllMediaURLIfNecessary: function() {
                if (this.pushNotificationUnderEdit.settings.android.mediaURL && this.pushNotificationUnderEdit.settings.ios.mediaURL) {
                    this.pushNotificationUnderEdit.settings.all.mediaURL = "";
                }
            },
            onAllMediaURLInput: function(value) {
                var self = this;
                this.pushNotificationUnderEdit.settings.all.mediaURL = value;
                this.$refs.allMediaURLValidationProvider.validate(value).then(function(result) {
                    self.afterMediaURLValidate(self.PlatformEnum.ALL, result.valid);
                });
            },
            onAndroidMediaURLInput: function(value) {
                var self = this;
                this.pushNotificationUnderEdit.settings.android.mediaURL = value;
                this.$refs.androidMediaURLValidationProvider.validate(value).then(function(result) {
                    self.afterMediaURLValidate(self.PlatformEnum.ANDROID, result.valid);
                });
                this.resetAllMediaURLIfNecessary();
            },
            onIOSMediaURLInput: function(value) {
                var self = this;
                this.pushNotificationUnderEdit.settings.ios.mediaURL = value;
                this.$refs.iosMediaURLValidationProvider.validate(value).then(function(result) {
                    self.afterMediaURLValidate(self.PlatformEnum.IOS, result.valid);
                });
                this.resetAllMediaURLIfNecessary();
            },
            afterMediaURLValidate: function(platform, isValid) {
                if (isValid) {
                    this.fetchMediaMetadata(platform, this.pushNotificationUnderEdit.settings[platform].mediaURL);
                }
            },
            setMediaMime: function(platform, mime) {
                this.pushNotificationUnderEdit.settings[platform].mediaMime = mime;
            },
            fetchMediaMetadata: function(platform, url) {
                var self = this;
                userovoPushNotification.service.fetchMediaMetadata(url).then(function(mediaMetadata) {
                    self.setMediaMime(platform, mediaMetadata.mime);
                }).catch(function() {
                    self.setMediaMime(platform, "");
                });
            },
            setCohortOptions: function(cohorts) {
                this.cohortOptions = cohorts;
            },
            fetchCohorts: function() {
                var self = this;
                this.isFetchCohortsLoading = true;
                userovoPushNotification.service.fetchCohorts()
                    .then(function(cohorts) {
                        self.setCohortOptions(cohorts);
                    }).catch(function(error) {
                        console.error(error);
                        self.setCohortOptions([]);
                    }).finally(function() {
                        self.isFetchCohortsLoading = false;
                    });
            },
            setLocationOptions: function(locations) {
                this.locationOptions = locations;
            },
            fetchLocations: function() {
                var self = this;
                this.isFetchLocationsLoading = true;
                userovoPushNotification.service.fetchLocations()
                    .then(function(locations) {
                        self.setLocationOptions(locations);
                    }).catch(function(error) {
                        console.error(error);
                        self.setLocationOptions([]);
                    }).finally(function() {
                        self.isFetchLocationsLoading = false;
                    });
            },
            setEventOptions: function(events) {
                this.eventOptions = events;
            },
            fetchEvents: function() {
                var self = this;
                this.isFetchEventsLoading = true;
                userovoPushNotification.service.fetchEvents()
                    .then(function(events) {
                        self.setEventOptions(events);
                    }).catch(function(error) {
                        console.error(error);
                        self.setEventOptions([]);
                    }).finally(function() {
                        self.isFetchEventsLoading = false;
                    });
            },
            setEnabledUsers: function(enabledUsers) {
                this.enabledUsers = enabledUsers;
            },
            setPushNotificationUnderEdit: function(value) {
                this.pushNotificationUnderEdit = value;
            },
            updateIosPlatformSettingsStateIfFound: function() {
                var self = this;
                if (this.pushNotificationUnderEdit.platforms.some(function(item) {
                    return item === self.PlatformEnum.IOS;
                })) {
                    this.settings[this.PlatformEnum.IOS].isMediaURLEnabled = Boolean(this.pushNotificationUnderEdit.settings[this.PlatformEnum.IOS].mediaURL);
                    this.settings[this.PlatformEnum.IOS].isSoundFilenameEnabled = Boolean(this.pushNotificationUnderEdit.settings[this.PlatformEnum.IOS].soundFilename);
                    this.settings[this.PlatformEnum.IOS].isBadgeNumberEnabled = Boolean(this.pushNotificationUnderEdit.settings[this.PlatformEnum.IOS].badgeNumber);
                    this.settings[this.PlatformEnum.IOS].isOnClickURLEnabled = Boolean(this.pushNotificationUnderEdit.settings[this.PlatformEnum.IOS].onClickURL);
                    this.settings[this.PlatformEnum.IOS].isJsonEnabled = Boolean(this.pushNotificationUnderEdit.settings[this.PlatformEnum.IOS].json);
                    this.settings[this.PlatformEnum.IOS].isUserDataEnabled = Boolean(this.pushNotificationUnderEdit.settings[this.PlatformEnum.IOS].userData.length);
                    this.settings[this.PlatformEnum.IOS].isSubtitleEnabled = Boolean(this.pushNotificationUnderEdit.settings[this.PlatformEnum.IOS].subtitle);
                    this.settings[this.PlatformEnum.IOS].isContentAvailableSet = Boolean(this.pushNotificationUnderEdit.settings[this.PlatformEnum.IOS].setContentAvailable);
                }
            },
            updateAndroidPlatformSettingsStateIfFound: function() {
                var self = this;
                if (this.pushNotificationUnderEdit.platforms.some(function(item) {
                    return item === self.PlatformEnum.ANDROID;
                })) {
                    this.settings[this.PlatformEnum.ANDROID].isMediaURLEnabled = Boolean(this.pushNotificationUnderEdit.settings[this.PlatformEnum.ANDROID].mediaURL);
                    this.settings[this.PlatformEnum.ANDROID].isSoundFilenameEnabled = Boolean(this.pushNotificationUnderEdit.settings[this.PlatformEnum.ANDROID].soundFilename);
                    this.settings[this.PlatformEnum.ANDROID].isBadgeNumberEnabled = Boolean(this.pushNotificationUnderEdit.settings[this.PlatformEnum.ANDROID].badgeNumber);
                    this.settings[this.PlatformEnum.ANDROID].isOnClickURLEnabled = Boolean(this.pushNotificationUnderEdit.settings[this.PlatformEnum.ANDROID].onClickURL);
                    this.settings[this.PlatformEnum.ANDROID].isJsonEnabled = Boolean(this.pushNotificationUnderEdit.settings[this.PlatformEnum.ANDROID].json);
                    this.settings[this.PlatformEnum.ANDROID].isUserDataEnabled = Boolean(this.pushNotificationUnderEdit.settings[this.PlatformEnum.ANDROID].userData.length);
                    this.settings[this.PlatformEnum.ANDROID].isIconEnabled = Boolean(this.pushNotificationUnderEdit.settings[this.PlatformEnum.ANDROID].icon);
                }
            },
            updateSettingsState: function() {
                this.updateIosPlatformSettingsStateIfFound();
                this.updateAndroidPlatformSettingsStateIfFound();
            },
            resetDelivery: function() {
                this.pushNotificationUnderEdit.delivery.startDate = Date.now();
                this.pushNotificationUnderEdit.delivery.endDate = null;
                this.pushNotificationUnderEdit.delivery.type = this.SendEnum.NOW;
            },
            updateOneTimeOptions: function() {
                if (this.userCommand === this.UserCommandEnum.DUPLICATE) {
                    this.resetDelivery();
                }
            },
            updateAutomaticOptions: function() {
                if (this.userCommand === this.UserCommandEnum.DUPLICATE) {
                    this.resetDelivery();
                    this.pushNotificationUnderEdit.automatic.usersTimezone = null;
                }
                if (this.pushNotificationUnderEdit.automatic.usersTimezone) {
                    this.isUsersTimezoneSet = true;
                }
                if (this.pushNotificationUnderEdit.delivery.endDate) {
                    this.isEndDateSet = true;
                }
            },
            updateTransactionalOptions: function() {
                if (this.userCommand === this.UserCommandEnum.DUPLICATE) {
                    this.resetDelivery();
                }
            },
            fetchPushNotificationById: function() {
                var self = this;
                this.setIsLoading(true);
                userovoPushNotification.service.fetchById(this.id)
                    .then(function(response) {
                        //Set default settings
                        response.isEe = (typeof userovoSegmentation !== 'undefined');
                        response.isGeo = (typeof userovoLocationTargetComponent !== 'undefined');
                        response.isCohorts = (typeof userovoCohorts !== 'undefined');
                        self.setPushNotificationUnderEdit(response);
                        if (self.userCommand === self.UserCommandEnum.DUPLICATE) {
                            self.setId(null);
                        }
                        self.resetMessageInHTMLToActiveLocalization();
                        self.updateSettingsState();
                        if (self.pushNotificationUnderEdit.type === self.TypeEnum.AUTOMATIC) {
                            self.updateAutomaticOptions();
                        }
                        if (self.pushNotificationUnderEdit.type === self.TypeEnum.ONE_TIME) {
                            self.updateOneTimeOptions();
                        }
                        if (self.pushNotificationUnderEdit.type === self.TypeEnum.TRANSACTIONAL) {
                            self.updateTransactionalOptions();
                        }
                        if (self.pushNotificationUnderEdit.type === self.TypeEnum.ONE_TIME) {
                            if (self.hasAnyFilters()) {
                                self.estimate();
                                return;
                            }
                            self.setEnabledUsers(self.$store.state.userovoPushNotificationDashboard.enabledUsers);
                        }
                    })
                    .catch(function(error) {
                        console.error(error);
                        var initialModel = JSON.parse(JSON.stringify(userovoPushNotification.helper.getInitialModel(self.type)));
                        initialModel.type = self.type;
                        self.setPushNotificationUnderEdit(initialModel);
                    })
                    .finally(function() {
                        self.setIsLoading(false);
                    });
            },
            shouldDisplayPlatformSettings: function(platform) {
                return this.pushNotificationUnderEdit.platforms.filter(function(selectedPlatform) {
                    return selectedPlatform === platform;
                }).length > 0;
            },
            setAppConfig: function(value) {
                this.appConfig = value;
            },
            getAppConfig: function() {
                var appConfig = userovoGlobal.apps[userovoCommon.ACTIVE_APP_ID] && userovoGlobal.apps[userovoCommon.ACTIVE_APP_ID].plugins || {};
                try {
                    this.setAppConfig(userovoPushNotification.mapper.incoming.mapAppLevelConfig(appConfig.push));
                }
                catch (error) {
                    console.error(error);
                }
            }
        },
        mounted: function() {
            this.fetchCohorts();
            this.fetchLocations();
            this.fetchEvents();
            this.getAppConfig();
        },
        components: {
            "message-setting-element": userovoPushNotificationComponent.MessageSettingElement,
            "mobile-message-preview": userovoPushNotificationComponent.MobileMessagePreview,
            "message-editor-with-emoji-picker": userovoPushNotificationComponent.MessageEditorWithEmojiPicker,
            "add-user-property-popover": userovoPushNotificationComponent.AddUserPropertyPopover,
            "large-radio-button-with-description": userovoPushNotificationComponent.LargeRadioButtonWithDescription,
            "line-radio-button-with-description": userovoPushNotificationComponent.LineRadioButtonWithDescription,
            "review-section-row": userovoPushNotificationComponent.ReviewSectionRow,
            'user-property-preview': userovoPushNotificationComponent.UserPropertyPreview,
            'user-property-text-preview': userovoPushNotificationComponent.UserPropertyTextPreview
        },
    });

    var PushNotificationTabView = userovoVue.views.create({
        template: "#push-notification-tab",
        mixins: [userovoVue.mixins.commonFormatters, userovoVue.mixins.auth(featureName)],
        data: function() {
            return {
                remoteTableDataSource: userovoVue.vuex.getServerDataSource(this.$store, "userovoPushNotificationMain", "pushTable"),
                platformFilters: platformFilterOptions,
                platformFilterLabels: {
                    oneTime: CV.i18n('push-notification.platform-filter-label-one-time'),
                    automatic: CV.i18n('push-notification.platform-filter-label-automatic'),
                    transactional: CV.i18n('push-notification.platform-filter-label-transactional')
                },
                statusFilters: statusFilterOptions,
                DEFAULT_ALPHA_COLOR_VALUE_HEX: 50,
                oneTimePeriodFilters: oneTimePeriodFilterOptions,
                selectedOneTimePeriodFilter: userovoPushNotification.service.PeriodEnum.WEEKLY,
                automaticPeriodFilters: automaticPeriodFilterOptions,
                statusOptions: userovoPushNotification.service.statusOptions,
                selectedAutomaticPeriodFilter: userovoPushNotification.service.PeriodEnum.DAILY,
                transactionalPeriodFilters: transactionalPeriodFilterOptions,
                selectedTransactionalPeriodFilter: userovoPushNotification.service.PeriodEnum.DAILY,
                TypeEnum: userovoPushNotification.service.TypeEnum,
                PlatformEnum: userovoPushNotification.service.PlatformEnum,
                UserCommandEnum: userovoPushNotification.service.UserCommandEnum,
                StatusEnum: userovoPushNotification.service.StatusEnum,
                optionalTableColumns: [
                    {
                        value: "content",
                        label: CV.i18n('push-notification.table-message-content'),
                        default: false
                    },
                    {
                        value: "createdBy",
                        label: CV.i18n('push-notification.table-created-by'),
                        default: false
                    }
                ]
            };
        },
        computed: {
            selectedPushNotificationType: function() {
                return this.$store.state.userovoPushNotificationMain.selectedPushNotificationType;
            },
            isDashboardLoading: function() {
                return this.$store.getters['userovoPushNotificationDashboard/isLoading'];
            },
            areRowsLoading: function() {
                return this.$store.state.userovoPushNotificationMain.areRowsLoading;
            },
            isUserCommandLoading: function() {
                return this.$store.getters['userovoPushNotificationMain/isLoading'];
            },
            pushNotificationOptions: function() {
                return {
                    xAxis: {
                        data: this.xAxisPushNotificationPeriods
                    },
                    series: this.yAxisPushNotificationSeries
                };
            },
            totalAppUsers: function() {
                return this.$store.state.userovoPushNotificationDashboard.totalAppUsers;
            },
            enabledUsers: function() {
                return this.$store.state.userovoPushNotificationDashboard.enabledUsers[this.PlatformEnum.ALL];
            },
            enabledUsersPercentage: function() {
                if (!this.totalAppUsers) {
                    return 0;
                }
                return parseInt(this.formatPercentage(this.enabledUsers / this.totalAppUsers));
            },
            xAxisPushNotificationPeriods: function() {
                return this.$store.state.userovoPushNotificationDashboard.periods[this.selectedPushNotificationType][this.selectedPeriodFilter];
            },
            yAxisPushNotificationSeries: function() {
                var self = this;
                return this.$store.state.userovoPushNotificationDashboard.series[this.selectedPushNotificationType][this.selectedPeriodFilter].map(function(pushNotificationSerie) {
                    return {
                        data: pushNotificationSerie.data[self.selectedPlatformFilter] || [],
                        name: pushNotificationSerie.label
                    };
                });
            },
            legend: function() {
                return {
                    show: true,
                    type: "primary",
                    data: [
                        {
                            name: CV.i18n('push-notification.sent-serie-name'),
                            value: this.formatNumber(this.$store.state.userovoPushNotificationDashboard.totalSent[this.selectedPushNotificationType][this.selectedPlatformFilter]),
                            tooltip: CV.i18n('push-notification.sent-serie-description')
                        },
                        {
                            name: CV.i18n('push-notification.actions-performed-serie-name'),
                            value: this.formatNumber(this.$store.state.userovoPushNotificationDashboard.totalActions[this.selectedPushNotificationType][this.selectedPlatformFilter]),
                            tooltip: CV.i18n('push-notification.actions-performed-serie-description')
                        }
                    ]
                };
            },
            selectedStatusFilter: {
                get: function() {
                    return this.$store.state.userovoPushNotificationMain.statusFilter;
                },
                set: function(value) {
                    this.$store.dispatch("userovoPushNotificationMain/onSetStatusFilter", value);
                    this.applyFilter();
                }
            },
            isLoading: {
                get: function() {
                    return this.$store.getters["userovoPushNotificationMain/isLoadingTable"];
                }
            },
            selectedPlatformFilter: {
                get: function() {
                    return this.$store.state.userovoPushNotificationMain.platformFilter;
                },
                set: function(value) {
                    this.$store.dispatch("userovoPushNotificationMain/onSetPlatformFilter", value);
                }
            },
            selectedPlatformFilterLabel: function() {
                return this.platformFilterLabel[this.selectedPushNotificationType];
            },
            selectedPeriodFilter: function() {
                if (this.selectedPushNotificationType === userovoPushNotification.service.TypeEnum.ONE_TIME) {
                    return this.selectedOneTimePeriodFilter;
                }
                else if (this.selectedPushNotificationType === userovoPushNotification.service.TypeEnum.AUTOMATIC) {
                    return this.selectedAutomaticPeriodFilter;
                }
                else {
                    return this.selectedTransactionalPeriodFilter;
                }
            },
            hasApproverPermission: function() {
                return userovoPushNotification.service.hasApproverPermission();
            },
        },
        methods: {
            refresh: function() {
                //this.$store.dispatch('userovoPushNotificationMain/fetchPushTable');
            },
            applyFilter: function() {
                this.$store.dispatch('userovoPushNotificationMain/fetchPushTable');
            },
            formatPercentage: function(value, decimalPlaces) {
                return this.formatNumber(UserovoHelpers.formatPercentage(value, decimalPlaces));
            },
            getPreviewPlatforms: function(platforms) {
                return platforms.map(function(item) {
                    return userovoPushNotification.service.platformOptions[item].label;
                }).sort().join(', ');
            },
            onApprove: function(id) {
                this.handleUserCommands(this.UserCommandEnum.APPROVE, id);
            },
            handleUserCommands: function(command, pushNotificationId) {
                this.$store.dispatch('userovoPushNotificationMain/onUserCommand', {type: command, pushNotificationId: pushNotificationId});
                switch (command) {
                case this.UserCommandEnum.RESEND: {
                    this.$store.dispatch('userovoPushNotificationMain/onSetIsDrawerOpen', true);
                    break;
                }
                case this.UserCommandEnum.DUPLICATE: {
                    this.$store.dispatch('userovoPushNotificationMain/onSetIsDrawerOpen', true);
                    break;
                }
                case this.UserCommandEnum.DELETE: {
                    this.$store.dispatch('userovoPushNotificationMain/onDelete', pushNotificationId);
                    break;
                }
                case this.UserCommandEnum.REJECT: {
                    this.$store.dispatch('userovoPushNotificationMain/onReject', pushNotificationId);
                    break;
                }
                case this.UserCommandEnum.APPROVE: {
                    this.$store.dispatch('userovoPushNotificationMain/onApprove', pushNotificationId);
                    break;
                }
                case this.UserCommandEnum.EDIT: {
                    this.$store.dispatch('userovoPushNotificationMain/onSetIsDrawerOpen', true);
                    break;
                }
                case this.UserCommandEnum.EDIT_DRAFT: {
                    this.$store.dispatch('userovoPushNotificationMain/onSetIsDrawerOpen', true);
                    break;
                }
                case this.UserCommandEnum.EDIT_REJECT: {
                    this.$store.dispatch('userovoPushNotificationMain/onSetIsDrawerOpen', true);
                    break;
                }
                case this.UserCommandEnum.STOP: {
                    this.$store.dispatch('userovoPushNotificationMain/onToggle', {id: pushNotificationId, isActive: false});
                    break;
                }
                case this.UserCommandEnum.START: {
                    this.$store.dispatch('userovoPushNotificationMain/onToggle', {id: pushNotificationId, isActive: true});
                    break;
                }
                case this.UserCommandEnum.CREATE: {
                    this.$store.dispatch('userovoPushNotificationMain/onSetIsDrawerOpen', true);
                    break;
                }
                default: {
                    throw new Error("Unknown user command:" + command);
                }
                }
            },
            shouldShowDuplicateUserCommand: function() {
                return this.canUserCreate;
            },
            shouldShowDeleteUserCommand: function() {
                return this.canUserDelete;
            },
            shouldShowResendUserCommand: function(status) {
                return (status === this.StatusEnum.STOPPED || status === this.StatusEnum.FAILED) && this.canUserCreate;
            },
            shouldShowEditDraftUserCommand: function(status) {
                return status === this.StatusEnum.DRAFT && this.canUserUpdate;
            },
            shouldShowEditRejectUserCommand: function(status) {
                return status === this.StatusEnum.REJECT && this.canUserUpdate;
            },
            shouldShowApproveUserCommand: function(status) {
                return status === this.StatusEnum.PENDING_APPROVAL && this.hasApproverPermission;
            },
            shouldShowRejectUserCommand: function(status) {
                return status === this.StatusEnum.PENDING_APPROVAL && this.hasApproverPermission;
            },
            shouldShowEditUserCommand: function(status) {
                return (status === this.StatusEnum.PENDING_APPROVAL || status === this.StatusEnum.SCHEDULED || status === this.StatusEnum.CREATED) && this.canUserUpdate;
            },
            shouldShowStartUserCommand: function(status) {
                if (this.selectedPushNotificationType === this.TypeEnum.ONE_TIME) {
                    return false;
                }
                if (!this.canUserUpdate) {
                    return false;
                }
                return status === this.StatusEnum.CREATED
                || status === this.StatusEnum.SENT
                || status === this.StatusEnum.STOPPED
                || status === this.StatusEnum.FAILED;
            },
            shouldShowStopUserCommand: function(status) {
                if (this.selectedPushNotificationType === this.TypeEnum.ONE_TIME) {
                    return false;
                }
                if (!this.canUserUpdate) {
                    return false;
                }
                return status === this.StatusEnum.SCHEDULED || status === this.StatusEnum.SENDING;
            },
            getStatusBackgroundColor: function(status) {
                switch (status) {
                case this.StatusEnum.CREATED: {
                    return "green";
                }
                case this.StatusEnum.PENDING_APPROVAL: {
                    return "yellow";
                }
                case this.StatusEnum.DRAFT: {
                    return "yellow";
                }
                case this.StatusEnum.SCHEDULED: {
                    return "yellow";
                }
                case this.StatusEnum.SENDING: {
                    return "blue";
                }
                case this.StatusEnum.SENT: {
                    return "green";
                }
                case this.StatusEnum.STOPPED: {
                    return "red";
                }
                case this.StatusEnum.FAILED: {
                    return "red";
                }
                case this.StatusEnum.REJECT: {
                    return "yellow";
                }
                default: {
                    return "#FFFFFF";
                }
                }
            },
            onRowClick: function(row) {
                window.location.hash = "#/messaging/details/" + row._id;
            }
        },
        mounted: function() {
            this.$store.dispatch('userovoPushNotificationMain/fetchPushTable', true);
        }
    });

    var PushNotificationView = userovoVue.views.create({
        template: "#push-notification",
        mixins: [userovoVue.mixins.hasDrawers("pushNotificationDrawer"), userovoVue.mixins.auth(featureName)],
        data: function() {
            return {
                pushNotificationTabs: [
                    {title: CV.i18n('push-notification.one-time'), name: userovoPushNotification.service.TypeEnum.ONE_TIME, component: PushNotificationTabView},
                    {title: CV.i18n('push-notification.automated'), name: userovoPushNotification.service.TypeEnum.AUTOMATIC, component: PushNotificationTabView},
                    {title: CV.i18n('push-notification.transactional'), name: userovoPushNotification.service.TypeEnum.TRANSACTIONAL, component: PushNotificationTabView}
                ],
                UserCommandEnum: userovoPushNotification.service.UserCommandEnum
            };
        },
        computed: {
            selectedPushNotificationTab: {
                get: function() {
                    return this.$store.state.userovoPushNotificationMain.selectedPushNotificationType;
                },
                set: function(value) {
                    this.$store.dispatch('userovoPushNotificationMain/onSetPushNotificationType', value);
                    this.$store.dispatch('userovoPushNotificationMain/fetchPushTable', true);
                }
            },
            isDrawerOpen: function() {
                return this.$store.state.userovoPushNotificationMain.isDrawerOpen;
            },
            userCommand: function() {
                return this.$store.state.userovoPushNotificationMain.userCommand;
            },
        },
        watch: {
            isDrawerOpen: function(value) {
                if (value) {
                    this.openDrawer("pushNotificationDrawer", {});
                }
            }
        },
        methods: {
            onCreatePushNotification: function() {
                this.$store.dispatch('userovoPushNotificationMain/onUserCommand', {type: this.UserCommandEnum.CREATE, pushNotificationId: null});
                this.$store.dispatch('userovoPushNotificationMain/onSetIsDrawerOpen', true);
            },
            onDrawerClose: function() {
                this.$store.dispatch('userovoPushNotificationMain/onSetIsDrawerOpen', false);
            },
            onSave: function() {
                this.$store.dispatch('userovoPushNotificationMain/fetchAll', true);
            },
            refresh: function() {
                this.$store.dispatch('userovoPushNotificationDashboard/fetchDashboard', true);
            }
        },
        mounted: function() {
            this.$store.dispatch('userovoPushNotificationDashboard/fetchDashboard');
        },
        components: {
            "push-notification-drawer": PushNotificationDrawer
        }
    });

    var mainPushNotificationVuex = [{
        clyModel: userovoPushNotification.main
    }, {
        clyModel: userovoPushNotification.dashboard
    }];

    var pushNotificationViewWrapper = new userovoVue.views.BackboneWrapper({
        component: PushNotificationView,
        vuex: mainPushNotificationVuex,
        templates: [
            "/push/templates/common-components.html",
            "/push/templates/push-notification.html",
            "/push/templates/push-notification-tab.html"
        ]
    });

    app.route('/messaging', 'messagingDashboardView', function() {
        if (!UserovoHelpers.isActiveAppMobile()) {
            window.location.hash = "/";
            return;
        }
        this.renderWhenReady(pushNotificationViewWrapper);
    });


    var PushNotificationDetailsView = userovoVue.views.BaseView.extend({
        template: "#push-notification-details",
        mixins: [userovoVue.mixins.hasDrawers("pushNotificationDrawer"), userovoVue.mixins.auth(featureName)],
        data: function() {
            return {
                StatusEnum: userovoPushNotification.service.StatusEnum,
                PlatformEnum: userovoPushNotification.service.PlatformEnum,
                TypeEnum: userovoPushNotification.service.TypeEnum,
                statusOptions: userovoPushNotification.service.statusOptions,
                currentSummaryTab: "message",
                UserCommandEnum: userovoPushNotification.service.UserCommandEnum,
                summaryTabs: [
                    {
                        title: CV.i18n('push-notification-details.message-tab'),
                        name: "message",
                        component: userovoPushNotificationComponent.DetailsMessageTab
                    },
                    {
                        title: CV.i18n('push-notification-details.targeting-tab'),
                        name: "targeting",
                        component: userovoPushNotificationComponent.DetailsTargetingTab
                    },
                    {
                        title: CV.i18n('push-notification-details.errors-tab'),
                        name: "errors",
                        component: userovoPushNotificationComponent.DetailsErrorsTab
                    }
                ],
                usersTargetedOptionsXAxis: {
                    type: "category",
                    data: [0],
                    show: false
                },
                usersTargetedOptionsYAxis: {
                    type: "value",
                    max: 100,
                    show: false,
                },
                barWidth: 150,
                barGrid: {
                    right: "80%",
                    left: 0,
                }
            };
        },
        computed: {
            pushNotification: function() {
                return this.$store.state.userovoPushNotificationDetails.pushNotification;
            },
            platformFilterOptions: function() {
                return this.$store.state.userovoPushNotificationDetails.platformFilterOptions;
            },
            localeFilterOptions: function() {
                if (this.pushNotification.dashboard[this.selectedPlatformFilter]) {
                    return Object.keys(this.pushNotification.dashboard[this.selectedPlatformFilter].locales).map(function(localeKey) {
                        return userovoPushNotification.mapper.incoming.mapLocalizationByKey(localeKey);
                    });
                }
                return [];
            },
            selectedMessageLocaleFilter: function() {
                return this.$store.state.userovoPushNotificationDetails.messageLocaleFilter;
            },
            message: function() {
                return this.$store.state.userovoPushNotificationDetails.pushNotification.message[this.selectedMessageLocaleFilter];
            },
            selectedDashboard: function() {
                var selectedDashboardFilter = this.pushNotification.dashboard[this.selectedPlatformFilter];
                if (this.selectedLocaleFilter) {
                    return selectedDashboardFilter.locales[this.selectedLocaleFilter];
                }
                if (!selectedDashboardFilter) {
                    return {};
                }
                return selectedDashboardFilter;
            },
            targetedUsers: function() {
                if (!this.selectedDashboard.processed) {
                    return 0;
                }
                return UserovoHelpers.formatPercentage(this.selectedDashboard.processed / this.selectedDashboard.total);
            },
            sentPushNotifications: function() {
                if (!this.selectedDashboard.sent) {
                    return 0;
                }
                return UserovoHelpers.formatPercentage(this.selectedDashboard.sent / this.selectedDashboard.processed);
            },
            clickedPushNotifications: function() {
                if (!this.selectedDashboard.actioned) {
                    return 0;
                }
                return UserovoHelpers.formatPercentage(this.selectedDashboard.actioned / this.selectedDashboard.sent);
            },
            failedPushNotifications: function() {
                if (!this.selectedDashboard.errored) {
                    return 0;
                }
                return UserovoHelpers.formatPercentage(this.selectedDashboard.errored / this.selectedDashboard.processed);
            },
            pushNotificationChartBars: function() {
                return {
                    targetedUsers: this.getDetailsBaseChartOptions(this.targetedUsers),
                    sentPushNotifications: this.getDetailsBaseChartOptions(this.sentPushNotifications),
                    clickedPushNotifications: this.getDetailsBaseChartOptions(this.clickedPushNotifications),
                    failedPushNotifications: this.getDetailsBaseChartOptions(this.failedPushNotifications)
                };
            },
            chartBarLegend: function() {
                return {
                    show: false
                };
            },
            isLoading: function() {
                return this.$store.getters['userovoPushNotificationDetails/isLoading'];
            },
            hasApproverPermission: function() {
                return userovoPushNotification.service.hasApproverPermission();
            },
            previewMessageMedia: function() {
                var result = {};
                result[this.PlatformEnum.ALL] = {url: this.pushNotification.settings[this.PlatformEnum.ALL].mediaURL, type: this.pushNotification.settings[this.PlatformEnum.ALL].mediaMime };
                result[this.PlatformEnum.IOS] = {url: this.pushNotification.settings[this.PlatformEnum.IOS].mediaURL, type: this.pushNotification.settings[this.PlatformEnum.IOS].mediaMime };
                result[this.PlatformEnum.ANDROID] = {url: this.pushNotification.settings[this.PlatformEnum.ANDROID].mediaURL, type: this.pushNotification.settings[this.PlatformEnum.ANDROID].mediaMime};
                return result;
            },
            isDrawerOpen: function() {
                return this.$store.state.userovoPushNotificationDetails.isDrawerOpen;
            },
            userCommand: function() {
                return this.$store.state.userovoPushNotificationDetails.userCommand;
            },
            selectedLocaleFilter: {
                get: function() {
                    return this.$store.state.userovoPushNotificationDetails.localeFilter;
                },
                set: function(value) {
                    this.$store.dispatch("userovoPushNotificationDetails/onSetLocaleFilter", value);
                }
            },
            selectedPlatformFilter: {
                get: function() {
                    return this.$store.state.userovoPushNotificationDetails.platformFilter;
                },
                set: function(value) {
                    this.$store.dispatch("userovoPushNotificationDetails/onSetPlatformFilter", value);
                    this.$store.dispatch("userovoPushNotificationDetails/onSetLocaleFilter", null);
                }
            },
            shouldShowGoToSentUrl: function() {
                return this.pushNotification.type === this.TypeEnum.ONE_TIME && this.selectedDashboard.sent > 0 && !this.pushNotification.demo;
            },
            shouldShowGoToErroredUrl: function() {
                return this.pushNotification.type === this.TypeEnum.ONE_TIME && this.selectedDashboard.errored > 0 && !this.pushNotification.demo;
            },
            shouldShowGoToActionedUrl: function() {
                return this.pushNotification.type === this.TypeEnum.ONE_TIME && this.selectedDashboard.actioned > 0 && !this.pushNotification.demo;
            },
            dashboardTokens: function() {
                return this.$store.state.userovoPushNotificationDashboard.tokens;
            }
        },
        watch: {
            isDrawerOpen: function(value) {
                if (value) {
                    this.openDrawer("pushNotificationDrawer", {});
                }
            }
        },
        methods: {
            onApprove: function(id) {
                this.handleUserCommands(this.UserCommandEnum.APPROVE, id);
            },
            onReject: function(id) {
                this.handleUserCommands(this.UserCommandEnum.REJECT, id);
            },
            handleUserCommands: function(command, pushNotificationId) {
                this.$store.dispatch('userovoPushNotificationDetails/onUserCommand', {type: command, pushNotificationId: pushNotificationId});
                switch (command) {
                case this.UserCommandEnum.RESEND: {
                    this.$store.dispatch('userovoPushNotificationDetails/onSetIsDrawerOpen', true);
                    break;
                }
                case this.UserCommandEnum.DUPLICATE: {
                    this.$store.dispatch('userovoPushNotificationDetails/onSetIsDrawerOpen', true);
                    break;
                }
                case this.UserCommandEnum.DELETE: {
                    this.$store.dispatch('userovoPushNotificationDetails/onDelete', pushNotificationId)
                        .then(function() {
                            window.location.hash = "#/messaging";
                        });
                    break;
                }
                case this.UserCommandEnum.REJECT: {
                    this.$store.dispatch('userovoPushNotificationDetails/onReject', pushNotificationId);
                    break;
                }
                case this.UserCommandEnum.APPROVE: {
                    this.$store.dispatch('userovoPushNotificationDetails/onApprove', pushNotificationId);
                    break;
                }
                case this.UserCommandEnum.EDIT: {
                    this.$store.dispatch('userovoPushNotificationDetails/onSetIsDrawerOpen', true);
                    break;
                }
                case this.UserCommandEnum.EDIT_DRAFT: {
                    this.$store.dispatch('userovoPushNotificationDetails/onSetIsDrawerOpen', true);
                    break;
                }
                case this.UserCommandEnum.EDIT_REJECT: {
                    this.$store.dispatch('userovoPushNotificationDetails/onSetIsDrawerOpen', true);
                    break;
                }
                case this.UserCommandEnum.STOP: {
                    this.$store.dispatch('userovoPushNotificationDetails/onToggle', {id: pushNotificationId, isActive: false});
                    break;
                }
                case this.UserCommandEnum.START: {
                    this.$store.dispatch('userovoPushNotificationDetails/onToggle', {id: pushNotificationId, isActive: true});
                    break;
                }
                case this.UserCommandEnum.CREATE: {
                    this.$store.dispatch('userovoPushNotificationDetails/onSetIsDrawerOpen', true);
                    break;
                }
                default: {
                    throw new Error("Unknown user command:" + command);
                }
                }
            },
            shouldShowDuplicateUserCommand: function() {
                return this.canUserCreate;
            },
            shouldShowDeleteUserCommand: function() {
                return this.canUserDelete;
            },
            shouldShowResendUserCommand: function(status) {
                return (status === this.StatusEnum.STOPPED || status === this.StatusEnum.FAILED) && this.canUserCreate;
            },
            shouldShowEditDraftUserCommand: function(status) {
                return status === this.StatusEnum.DRAFT && this.canUserUpdate;
            },
            shouldShowEditRejectUserCommand: function(status) {
                return status === this.StatusEnum.REJECT && this.canUserUpdate;
            },
            shouldShowApproveUserCommand: function(status) {
                return status === this.StatusEnum.PENDING_APPROVAL && this.hasApproverPermission;
            },
            shouldShowRejectUserCommand: function(status) {
                return status === this.StatusEnum.PENDING_APPROVAL && this.hasApproverPermission;
            },
            shouldShowEditUserCommand: function(status) {
                return (status === this.StatusEnum.PENDING_APPROVAL || status === this.StatusEnum.SCHEDULED) && this.canUserUpdate;
            },
            shouldShowStartUserCommand: function(status) {
                if (this.pushNotification.type === this.TypeEnum.ONE_TIME) {
                    return false;
                }
                if (!this.canUserUpdate) {
                    return false;
                }
                return status === this.StatusEnum.CREATED
                || status === this.StatusEnum.SENT
                || status === this.StatusEnum.STOPPED
                || status === this.StatusEnum.FAILED;
            },
            shouldShowStopUserCommand: function(status) {
                if (this.pushNotification.type === this.TypeEnum.ONE_TIME) {
                    return false;
                }
                if (!this.canUserUpdate) {
                    return false;
                }
                return status === this.StatusEnum.SCHEDULED || status === this.StatusEnum.SENDING;
            },
            getStatusBackgroundColor: function(status) {
                switch (status) {
                case this.StatusEnum.CREATED: {
                    return "green";
                }
                case this.StatusEnum.PENDING_APPROVAL: {
                    return "yellow";
                }
                case this.StatusEnum.DRAFT: {
                    return "yellow";
                }
                case this.StatusEnum.SCHEDULED: {
                    return "yellow";
                }
                case this.StatusEnum.SENDING: {
                    return "blue";
                }
                case this.StatusEnum.SENT: {
                    return "green";
                }
                case this.StatusEnum.STOPPED: {
                    return "red";
                }
                case this.StatusEnum.FAILED: {
                    return "red";
                }
                case this.StatusEnum.REJECT: {
                    return "yellow";
                }
                default: {
                    return "#FFFFFF";
                }
                }
            },
            formatTimeAgoText: function(date) {
                return userovoCommon.formatTimeAgoText(date).text;
            },
            getDetailsBaseChartOptions: function(seriesData) {
                return {
                    xAxis: this.usersTargetedOptionsXAxis,
                    yAxis: this.usersTargetedOptionsYAxis,
                    series: [{data: [seriesData]}, this.getRemainingStackBar(seriesData)],
                    tooltip: {show: false},
                    stack: 'total',
                    grid: this.barGrid,
                    barWidth: this.barWidth
                };
            },
            getRemainingStackBar: function(value) {
                return {data: [100 - value], itemStyle: {color: "#E2E4E8"}, silent: true};
            },
            onDrawerClose: function() {
                this.$store.dispatch('userovoPushNotificationDetails/onSetIsDrawerOpen', false);
            },
            onGoToSent: function() {
                var queryData = {message: {$in: [this.pushNotification._id]}};
                UserovoHelpers.goTo({
                    url: '/users/qfilter/' + JSON.stringify(queryData),
                    from: "#/" + userovoCommon.ACTIVE_APP_ID + "/messaging/details/" + this.pushNotification._id,
                    title: CV.i18n("push-notification.back-to-push-notification-details")
                });
            },
            onGoToActioned: function() {
                var queryData = {
                    app_id: userovoCommon.ACTIVE_APP_ID,
                    event: "[CLY]_push_action",
                    method: "segmentation_users",
                    period: "month",
                    bucket: "daily",
                    projectionKey: "",
                    queryObject: JSON.stringify({
                        "sg.i": {"$in": [this.pushNotification._id]}
                    })
                };
                UserovoHelpers.goTo({
                    url: '/users/request/' + JSON.stringify(queryData),
                    from: "#/" + userovoCommon.ACTIVE_APP_ID + "/messaging/details/" + this.pushNotification._id,
                    title: CV.i18n("push-notification.back-to-push-notification-details")
                });
            },
            onGoToErrored: function() {
                var self = this;
                var queryData = {message: {"$nin": [this.pushNotification._id]}};
                var $in = [];
                if (this.pushNotification.user) {
                    queryData.user = this.pushNotification.user;
                }
                if (this.pushNotification.locations && this.pushNotification.locations.length) {
                    queryData.geo = {"$in": this.pushNotification.locations};
                }
                if (this.pushNotification.cohorts && this.pushNotification.cohorts.length) {
                    queryData.chr = {"$in": this.pushNotification.cohorts};
                }
                var platformIndex = 2;
                Object.keys(this.dashboardTokens).forEach(function(tokenName) {
                    if (self.pushNotification.platforms.some(function(platformName) {
                        // Note: token name format is 'tk'+platform+token_subtype.
                        if (platformName === self.PlatformEnum.ANDROID) {
                            return 'a' === tokenName.charAt(platformIndex);
                        }
                        if (platformName === self.PlatformEnum.IOS) {
                            return 'i' === tokenName.charAt(platformIndex);
                        }
                    })) {
                        $in.push(tokenName);
                    }
                });
                if ($in.length) {
                    queryData.push = {};
                    queryData.push.$in = $in;
                }
                UserovoHelpers.goTo({
                    url: '/users/qfilter/' + JSON.stringify(queryData),
                    from: "#/" + userovoCommon.ACTIVE_APP_ID + "/messaging/details/" + this.pushNotification._id,
                    title: CV.i18n("push-notification.back-to-push-notification-details")
                });
            },
            onMobileMessagePlatformChange: function(value) {
                this.$store.dispatch('userovoPushNotificationDetails/onSetMobileMessagePlatform', value);
            },
        },
        components: {
            "mobile-message-preview": userovoPushNotificationComponent.MobileMessagePreview,
            "push-notification-drawer": PushNotificationDrawer
        },
        mounted: function() {
            if (this.$route.params.id) {
                this.$store.dispatch('userovoPushNotificationDetails/fetchById', this.$route.params.id);
                this.$store.dispatch('userovoPushNotificationDashboard/fetchDashboard');
            }
        }
    });

    var detailsPushNotificationVuex = [{
        clyModel: userovoPushNotification.details
    }, {
        clyModel: userovoPushNotification.dashboard
    }];

    var pushNotificationDetailsViewWrapper = new userovoVue.views.BackboneWrapper({
        component: PushNotificationDetailsView,
        vuex: detailsPushNotificationVuex,
        templates: [
            "/push/templates/common-components.html",
            "/push/templates/push-notification-details.html"
        ],
    });

    app.route('/messaging/details/*id', "messagingDetails", function(id) {
        if (!UserovoHelpers.isActiveAppMobile()) {
            window.location.hash = "/";
            return;
        }
        pushNotificationDetailsViewWrapper.params = {
            id: id
        };
        this.renderWhenReady(pushNotificationDetailsViewWrapper);
    });

    //Push plugin application level configuration view
    var initialAppLevelConfig = {
        rate: "",
        period: ""
    };
    initialAppLevelConfig[userovoPushNotification.service.PlatformEnum.IOS] = {
        _id: "",
        keyId: "",
        p8KeyFile: "",
        p12KeyFile: "",
        teamId: "",
        bundleId: "",
        authType: userovoPushNotification.service.IOSAuthConfigTypeEnum.P8,
        passphrase: "",
        hasKeyFile: false,
        hasUploadedKeyFile: false,
    };
    initialAppLevelConfig[userovoPushNotification.service.PlatformEnum.ANDROID] = {
        _id: "",
        serviceAccountFile: "",
        type: "fcm",
        hasServiceAccountFile: false,
        hasUploadedServiceAccountFile: false,
    };
    initialAppLevelConfig[userovoPushNotification.service.PlatformEnum.HUAWEI] = {
        _id: "",
        type: "hms",
        appId: "",
        appSecret: ""
    };

    var keyFileReader = new FileReader();
    var serviceAccountFileReader = new FileReader();

    var initialTestUsersRows = {};
    initialTestUsersRows[userovoPushNotification.service.AddTestUserDefinitionTypeEnum.USER_ID] = [];
    initialTestUsersRows[userovoPushNotification.service.AddTestUserDefinitionTypeEnum.COHORT] = [];

    var PushNotificationAppConfigView = userovoVue.views.create({
        componentName: "AppSettingsContainerObservable",
        template: CV.T("/push/templates/push-notification-app-config.html"),
        mixins: [userovoVue.mixins.hasDrawers("testUsersDrawer")],
        data: function() {
            return {
                PlatformEnum: userovoPushNotification.service.PlatformEnum,
                IOSAuthConfigTypeEnum: userovoPushNotification.service.IOSAuthConfigTypeEnum,
                iosAuthConfigType: userovoPushNotification.service.IOSAuthConfigTypeEnum.P8,
                iosAuthConfigTypeOptions: userovoPushNotification.service.iosAuthConfigTypeOptions,
                viewModel: JSON.parse(JSON.stringify(initialAppLevelConfig)),
                modelUnderEdit: Object.assign({}, { rate: "", period: ""}),
                uploadedIOSKeyFilename: '',
                uploadedAndroidServiceAccountFilename: '',
                isIOSConfigTouched: false,
                isHuaweiConfigTouched: false,
                AddTestUserDefinitionTypeEnum: userovoPushNotification.service.AddTestUserDefinitionTypeEnum,
                userIdOptions: [],
                cohortOptions: [],
                isSearchUsersLoading: false,
                isFetchCohortsLoading: false,
                isUpdateTestUsersLoading: false,
                isDialogVisible: false,
                areRowsLoading: false,
                testUsersRows: initialTestUsersRows,
                selectedKeyToDelete: null,
                selectedTestUsersListOption: userovoPushNotification.service.AddTestUserDefinitionTypeEnum.USER_ID,
                testUsersListOptions: [
                    {label: CV.i18n('push-notification.user-id'), value: userovoPushNotification.service.AddTestUserDefinitionTypeEnum.USER_ID},
                    {label: CV.i18n('push-notification.cohort-name'), value: userovoPushNotification.service.AddTestUserDefinitionTypeEnum.COHORT}
                ]
            };
        },
        computed: {
            isHuaweiConfigRequired: function() {
                return this.isHuaweiConfigTouched;
            },
            isIOSConfigRequired: function() {
                return this.isIOSConfigTouched;
            },
            selectedTestUsersRows: function() {
                return this.testUsersRows[this.selectedTestUsersListOption];
            },
            selectedAppId: function() {
                return this.$store.state.userovoAppManagement.selectedAppId;
            }
        },
        watch: {
            selectedAppId: function() {
                this.iosAuthConfigType = userovoPushNotification.service.IOSAuthConfigTypeEnum.P8;
                this.resetConfig();
                this.reconcilate();
            }
        },
        methods: {
            setModel: function(newModel) {
                Object.assign(this.modelUnderEdit, newModel);
            },
            setViewModel: function(newViewModel) {
                this.viewModel = JSON.parse(JSON.stringify(newViewModel));
            },
            resetConfig: function() {
                this.setViewModel(initialAppLevelConfig);
                this.setModel({rate: "", period: ""});
                this.$refs.keyFileUploader.clearFiles();
                this.isHuaweiConfigTouched = false;
                this.isIOSConfigTouched = false;
                this.uploadedIOSKeyFilename = '';
                this.uploadedAndroidServiceAccountFilename = '';
                this.cohortOptions = [];
            },
            onIOSAuthTypeChange: function(value) {
                this.iosAuthConfigType = value;
                this.$refs.keyFileUploader.clearFiles();
                this.uploadedIOSKeyFilename = '';
                this.isIOSConfigTouched = true;
                var appPluginConfigDto = userovoGlobal.apps[this.selectedAppId].plugins;
                var pushNotificationAppConfigDto = appPluginConfigDto && appPluginConfigDto.push;
                var model = userovoPushNotification.mapper.incoming.mapAppLevelConfig(pushNotificationAppConfigDto);
                if (model && model[this.PlatformEnum.IOS] && model[this.PlatformEnum.IOS].authType === value) {
                    this.setModel(model);
                    this.reconcilateViewModel(model);
                }
                else {
                    this.resetIOSModelPlatform();
                    this.resetIOSViewModelPlatform();
                    this.dispatchAppLevelConfigChangeEvent('authType', this.PlatformEnum.IOS);
                }
            },
            setKeyFile: function(dataUrlFile) {
                this.initializeModelPlatformIfNotFound(this.PlatformEnum.IOS);
                if (this.iosAuthConfigType === this.IOSAuthConfigTypeEnum.P8) {
                    this.modelUnderEdit[this.PlatformEnum.IOS].p8KeyFile = dataUrlFile;
                }
                else {
                    this.modelUnderEdit[this.PlatformEnum.IOS].p12KeyFile = dataUrlFile;
                }
                this.modelUnderEdit[this.PlatformEnum.IOS].hasUploadedKeyFile = true;
                this.isIOSConfigTouched = true;
            },
            setServiceAccountFile: function(dataUrlFile) {
                this.initializeModelPlatformIfNotFound(this.PlatformEnum.ANDROID);
                this.modelUnderEdit[this.PlatformEnum.ANDROID].serviceAccountFile = dataUrlFile;
                this.modelUnderEdit[this.PlatformEnum.ANDROID].hasUploadedServiceAccountFile = true;
            },
            onKeyFileChange: function(file) {
                this.uploadedIOSKeyFilename = file.name;
                keyFileReader.readAsDataURL(file.raw);
            },
            onServiceAccountFileChange: function(file) {
                this.uploadedAndroidServiceAccountFilename = file.name;
                serviceAccountFileReader.readAsDataURL(file.raw);
            },
            resetIOSViewModelPlatform: function() {
                var platform = this.PlatformEnum.IOS;
                this.viewModel[platform] = Object.assign({}, initialAppLevelConfig[platform]);
                this.viewModel[platform].authType = this.iosAuthConfigType;
            },
            resetIOSModelPlatform: function() {
                var platform = this.PlatformEnum.IOS;
                this.modelUnderEdit[this.PlatformEnum.IOS] = Object.assign({}, initialAppLevelConfig[platform]);
                this.modelUnderEdit[platform].authType = this.iosAuthConfigType;
            },
            initializeModelPlatformIfNotFound: function(platform) {
                if (!this.modelUnderEdit[platform]) {
                    this.modelUnderEdit[platform] = Object.assign({}, initialAppLevelConfig[platform]);
                    if (platform === this.PlatformEnum.IOS) {
                        this.modelUnderEdit[platform].authType = this.iosAuthConfigType;
                    }
                }
            },
            dispatchAppLevelConfigChangeEvent: function(property, platform) {
                if (platform) {
                    var platformDto = userovoPushNotification.mapper.outgoing.mapPlatformItem(platform);
                    var appConfigPlatformDto = userovoPushNotification.mapper.outgoing.mapAppLevelConfigByPlatform(this.modelUnderEdit, platform);
                    this.$emit('change', 'push' + '.' + platformDto, appConfigPlatformDto);
                }
                else {
                    this.$emit('change', 'push' + '.' + 'rate' + '.' + property, this.modelUnderEdit[property]);
                }
            },
            updateAllModelsOnInput: function(property, value, platform) {
                if (platform) {
                    this.viewModel[platform][property] = value;
                    this.modelUnderEdit[platform][property] = value;
                }
                else {
                    this.viewModel[property] = value;
                    this.modelUnderEdit[property] = value;
                }
            },
            setIsConfigTouchedByPlatform: function(platform) {
                if (platform === this.PlatformEnum.IOS) {
                    this.isIOSConfigTouched = true;
                }
                if (platform === this.PlatformEnum.HUAWEI) {
                    this.isHuaweiConfigTouched = true;
                }
            },
            onInput: function(property, value, platform) {
                if (platform) {
                    this.initializeModelPlatformIfNotFound(platform);
                    this.setIsConfigTouchedByPlatform(platform);
                }
                this.updateAllModelsOnInput(property, value, platform);
                this.dispatchAppLevelConfigChangeEvent(property, platform);
            },
            onDiscard: function() {
                this.resetConfig();
                this.reconcilate();
            },
            isKeyEmpty: function(platform) {
                if (platform === this.PlatformEnum.ANDROID) {
                    return !this.viewModel[platform].serviceAccountFile;
                }
                if (platform === this.PlatformEnum.IOS) {
                    if (this.iosAuthConfigType === userovoPushNotification.service.IOSAuthConfigTypeEnum.P8) {
                        return !(this.viewModel[platform].p8KeyFile || this.viewModel[platform].keyId || this.viewModel[platform].teamId || this.viewModel[platform].bundleId);
                    }
                    if (this.iosAuthConfigType === userovoPushNotification.service.IOSAuthConfigTypeEnum.P12) {
                        return !(this.viewModel[platform].p12KeyFile || this.viewModel[platform].passphrase);
                    }
                }
                if (platform === this.PlatformEnum.HUAWEI) {
                    return !(this.viewModel[platform].appId || this.viewModel[platform].appSecret);
                }
                throw new Error('Unknown key platform, received:' + platform);
            },
            onDeleteKey: function(platformKey) {
                this.selectedKeyToDelete = platformKey;
                UserovoHelpers.confirm('', 'danger', this.onConfirmCallback, [CV.i18n('push-notification.cancel'), CV.i18n('push-notification.i-understand-delete-key')], {title: CV.i18n('push-notification.delete-key')});
            },
            deleteAndroidKey: function() {
                var platform = this.PlatformEnum.ANDROID;
                var platformDto = userovoPushNotification.mapper.outgoing.mapPlatformItem(platform);
                this.modelUnderEdit[platform] = Object.assign({}, initialAppLevelConfig[platform]);
                this.viewModel[platform] = Object.assign({}, initialAppLevelConfig[platform]);
                this.$emit('change', 'push' + '.' + platformDto, null);
            },
            deleteIosKey: function() {
                var platform = this.PlatformEnum.IOS;
                var platformDto = userovoPushNotification.mapper.outgoing.mapPlatformItem(platform);
                this.modelUnderEdit[platform] = Object.assign({}, initialAppLevelConfig[platform]);
                this.viewModel[platform] = Object.assign({}, initialAppLevelConfig[platform]);
                this.modelUnderEdit[platform].authType = this.iosAuthConfigType;
                this.viewModel[platform].authType = this.iosAuthConfigType;
                this.$emit('change', 'push' + '.' + platformDto, null);
                this.isIOSConfigTouched = false;
                this.uploadedIOSKeyFilename = "";
            },
            deleteHuaweiKey: function() {
                var platform = this.PlatformEnum.HUAWEI;
                var platformDto = userovoPushNotification.mapper.outgoing.mapPlatformItem(platform);
                this.modelUnderEdit[platform] = Object.assign({}, initialAppLevelConfig[platform]);
                this.viewModel[platform] = Object.assign({}, initialAppLevelConfig[platform]);
                this.$emit('change', 'push' + '.' + platformDto, null);
                this.isHuaweiConfigTouched = false;
            },
            deleteKeyOnCofirm: function() {
                if (this.selectedKeyToDelete === this.PlatformEnum.ANDROID) {
                    this.deleteAndroidKey();
                    return;
                }
                if (this.selectedKeyToDelete === this.PlatformEnum.IOS) {
                    this.deleteIosKey();
                    return;
                }
                if (this.selectedKeyToDelete === this.PlatformEnum.HUAWEI) {
                    this.deleteHuaweiKey();
                    return;
                }
                if (!this.selectedKeyToDelete) {
                    return;
                }
                throw new Error('Unknown key platform to delete, received:' + this.selectedKeyToDelete);
            },
            onConfirmCallback: function(isConfirmed) {
                if (isConfirmed) {
                    this.deleteKeyOnCofirm();
                }
                this.selectedKeyToDelete = null;
            },
            addSelectedAppEventListener: function(callback) {
                this.$on('selectedApp', callback);
            },
            addDiscardEventListener: function(callback) {
                this.$on('discard', callback);
            },
            addKeyFileReaderLoadListener: function(callback) {
                keyFileReader.addEventListener('load', callback);
            },
            removeKeyFileReaderLoadListener: function(callback) {
                keyFileReader.removeEventListener('load', callback);
            },
            onKeyFileReady: function() {
                this.setKeyFile(keyFileReader.result);
                if (this.iosAuthConfigType === this.IOSAuthConfigTypeEnum.P8) {
                    this.dispatchAppLevelConfigChangeEvent('p8KeyFile', this.PlatformEnum.IOS);
                }
                else {
                    this.dispatchAppLevelConfigChangeEvent('p12KeyFile', this.PlatformEnum.IOS);
                }
            },
            addServiceAccountFileReaderLoadListener: function(callback) {
                serviceAccountFileReader.addEventListener("load", callback);
            },
            removeServiceAccountFileReaderLoadListener: function(callback) {
                serviceAccountFileReader.removeEventListener("load", callback);
            },
            onServiceAccountFileReady: function() {
                this.setServiceAccountFile(serviceAccountFileReader.result);
                this.dispatchAppLevelConfigChangeEvent('serviceAccountFile', this.PlatformEnum.ANDROID);
            },
            reconcilateViewModel: function(newModel) {
                var self = this;
                Object.keys(this.PlatformEnum).forEach(function(platformKey) {
                    var platform = self.PlatformEnum[platformKey];
                    self.viewModel[platform] = newModel[platform] || Object.assign({}, initialAppLevelConfig[platform]);
                });
                this.viewModel.period = newModel.period;
                this.viewModel.rate = newModel.rate;
            },
            reconcilate: function() {
                var appPluginConfigDto = userovoGlobal.apps[this.selectedAppId].plugins;
                var pushNotificationAppConfigDto = appPluginConfigDto && appPluginConfigDto.push;
                if (pushNotificationAppConfigDto) {
                    var model = userovoPushNotification.mapper.incoming.mapAppLevelConfig(pushNotificationAppConfigDto);
                    this.reconcilateViewModel(model);
                    this.setModel(model);
                    if (model[this.PlatformEnum.IOS]) {
                        this.iosAuthConfigType = model[this.PlatformEnum.IOS].authType;
                    }
                }
            },
            setUserIdOptions: function(userIds) {
                this.userIdOptions = userIds;
            },
            setCohortOptions: function(cohorts) {
                this.cohortOptions = cohorts;
            },
            setTestUserRows: function(testUsers) {
                this.testUsersRows = testUsers;
            },
            openTestUsersDialog: function() {
                this.isDialogVisible = true;
            },
            fetchCohortsIfNotFound: function() {
                var self = this, appId = this.selectedAppId;
                if (this.cohortOptions && this.cohortOptions.length) {
                    return;
                }
                this.isFetchCohortsLoading = true;
                userovoPushNotification.service.fetchCohorts(undefined, undefined, self.selectedAppId)
                    .then(function(cohorts) {
                        self.setCohortOptions(cohorts);
                    }).catch(function(error) {
                        console.error(error);
                        self.setCohortOptions([]);
                    }).finally(function() {
                        if (appId !== self.selectedAppId) {
                            self.setCohortOptions([]);
                            self.fetchCohortsIfNotFound();
                        }
                        else {
                            self.isFetchCohortsLoading = false;
                        }
                    });
            },
            fetchTestUsers: function() {
                var self = this;
                var testUsers = this.getTestUsersFromAppConfig();
                var options = {};
                options.appId = this.selectedAppId;
                this.areRowsLoading = true;
                userovoPushNotification.service.fetchTestUsers(testUsers, options)
                    .then(function(testUserRows) {
                        self.setTestUserRows(testUserRows);
                    }).catch(function(error) {
                        console.error(error);
                        self.setTestUserRows([]);
                        UserovoHelpers.notify({message: error.message, type: 'error'});
                    }).finally(function() {
                        self.areRowsLoading = false;
                    });
            },
            getTestUsersFromAppConfig: function() {
                var appConfig = userovoGlobal.apps[this.selectedAppId].plugins;
                var pushNotificationConfig = appConfig && appConfig.push || {};
                var result = {};
                if (pushNotificationConfig && pushNotificationConfig.test) {
                    if (pushNotificationConfig.test.uids) {
                        result.uids = pushNotificationConfig.test.uids.split(',');
                    }
                    if (pushNotificationConfig.test.cohorts) {
                        result.cohorts = pushNotificationConfig.test.cohorts.split(',');
                    }
                }
                return result;
            },
            onAddNewTestUser: function() {
                this.openDrawer('testUsersDrawer', userovoPushNotification.helper.getInitialTestUsersAppConfigModel());
            },
            onShowTestUserList: function() {
                this.openTestUsersDialog();
                this.fetchTestUsers();
            },
            onOpen: function() {
                this.fetchCohortsIfNotFound();
            },
            updateTestUsersAppConfig: function(editedObject) {
                var testDto = userovoPushNotification.mapper.outgoing.mapTestUsersEditedModelToDto(editedObject);
                userovoGlobal.apps[this.selectedAppId].plugins.push.test = testDto;
            },
            onDeleteTestUser: function(row) {
                var self = this;
                var actualTestUsers = this.getTestUsersFromAppConfig();
                if (this.selectedTestUsersListOption === this.AddTestUserDefinitionTypeEnum.USER_ID) {
                    actualTestUsers.uids = actualTestUsers.uids.filter(function(uid) {
                        return uid !== row.uid && Boolean(uid);
                    });
                }
                if (this.selectedTestUsersListOption === this.AddTestUserDefinitionTypeEnum.COHORT) {
                    actualTestUsers.cohorts = actualTestUsers.cohorts.filter(function(cohortId) {
                        return cohortId !== row._id && Boolean(cohortId);
                    });
                }
                var newTestUsersModel = {
                    definitionType: this.selectedTestUsersListOption,
                    cohorts: actualTestUsers.cohorts,
                    userIds: actualTestUsers.uids,
                };
                var options = {};
                options.app_id = this.selectedAppId;
                this.isUpdateTestUsersLoading = true;
                userovoPushNotification.service.updateTestUsers(newTestUsersModel, options).
                    then(function() {
                        self.updateTestUsersAppConfig(newTestUsersModel);
                        UserovoHelpers.notify({message: CV.i18n('push-notification.test-users-were-successfully-removed')});
                        self.fetchTestUsers();
                    }).catch(function(error) {
                        console.error(error);
                        UserovoHelpers.notify({message: error.message, type: 'error'});
                    }).finally(function() {
                        self.isUpdateTestUsersLoading = false;
                    });
            },
            onSubmit: function(editedObject, done) {
                var self = this;
                var actualTestUsersConfig = this.getTestUsersFromAppConfig();
                if (editedObject.definitionType === this.AddTestUserDefinitionTypeEnum.USER_ID) {
                    editedObject.cohorts = actualTestUsersConfig.cohorts;
                    editedObject.userIds = editedObject.userIds.concat(actualTestUsersConfig.uids);
                }
                if (editedObject.definitionType === this.AddTestUserDefinitionTypeEnum.COHORT) {
                    editedObject.cohorts = editedObject.cohorts.concat(actualTestUsersConfig.cohorts);
                    editedObject.userIds = actualTestUsersConfig.uids;
                }
                var options = {};
                options.app_id = this.selectedAppId;
                this.isUpdateTestUsersLoading = true;
                userovoPushNotification.service.updateTestUsers(editedObject, options).
                    then(function() {
                        self.updateTestUsersAppConfig(editedObject);
                        done();
                        UserovoHelpers.notify({message: CV.i18n('push-notification.test-users-were-successfully-added')});
                    }).catch(function(error) {
                        console.error(error);
                        UserovoHelpers.notify({message: error.message, type: 'error'});
                        done(error);
                    }).finally(function() {
                        self.isUpdateTestUsersLoading = false;
                    });
            },
            onSearchUsers: function(query) {
                var self = this;
                this.isSearchUsersLoading = true;
                var options = {};
                options.appId = this.selectedAppId;
                userovoPushNotification.service.searchUsersById(query, options)
                    .then(function(userIds) {
                        self.setUserIdOptions(userIds);
                    }).catch(function(error) {
                        console.error(error);
                        self.setUserIdOptions([]);
                        UserovoHelpers.notify({message: error.message, type: 'error'});
                    }).finally(function() {
                        self.isSearchUsersLoading = false;
                    });
            },
        },
        mounted: function() {
            this.addKeyFileReaderLoadListener(this.onKeyFileReady);
            this.addServiceAccountFileReaderLoadListener(this.onServiceAccountFileReady);
            this.addDiscardEventListener(this.onDiscard);
            this.reconcilate();
        },
        beforeDestroy: function() {
            this.removeKeyFileReaderLoadListener(this.onKeyFileReady);
            this.removeServiceAccountFileReaderLoadListener(this.onServiceAccountFileReady);
        }
    });

    userovoVue.container.registerData("/app/settings", {
        _id: "push",
        inputs: {},
        permission: featureName,
        title: CV.i18n('push-notification.title'),
        component: PushNotificationAppConfigView
    });

    //NOTE: modifyUserDetailsForPush adds the create new message action in user details page and sends the message to the actual user
    //     /**
    // * Modify user profile views with push additions
    // **/
    //     function modifyUserDetailsForPush() {
    //         if (Array.isArray(userovoGlobal.member.restrict) && userovoGlobal.member.restrict.indexOf('#/messaging') !== -1 || !userovoAuth.validateCreate(featureName)) {
    //             return;
    //         }
    //         if (Backbone.history.fragment.indexOf('manage/') === -1 && userovoGlobal.apps[userovoCommon.ACTIVE_APP_ID].type === 'mobile') {
    //         //check if it is profile view
    //             if (app.activeView.updateEngagement) {
    //                 var userDetails = userovoUserdata.getUserdetails();

    //                 var tokens = [], platforms = [], test = false, prod = false;
    //                 tokens = Object.keys(userDetails).filter(function(k) {
    //                     return k.indexOf('tk') === 0;
    //                 }).map(function(k) {
    //                     return k.substr(2);
    //                 });
    //                 if (userDetails.tkid || userDetails.tkia || userDetails.tkip) {
    //                     platforms.push('i');
    //                 }
    //                 if (userDetails.tkat || userDetails.tkap) {
    //                     platforms.push('a');
    //                 }

    //                 test = !!userDetails.tkid || !!userDetails.tkia || !!userDetails.tkat;
    //                 prod = !!userDetails.tkip || !!userDetails.tkap;

    //                 if (tokens.length && userovoAuth.validateCreate('push')) {
    //                     if (!$('.btn-create-message').length) {
    //                         $('#user-profile-detail-buttons .cly-button-menu').append('<div class="item btn-create-message" >' + jQuery.i18n.map['push.create'] + '</div>');
    //                         app.activeView.resetExportSubmenu();
    //                     }
    //                     $('.btn-create-message').show().off('click').on('click', function() {
    //                         if (platforms.length) {
    //                             components.push.popup.show({
    //                                 platforms: platforms,
    //                                 apps: [userovoCommon.ACTIVE_APP_ID],
    //                                 test: test && !prod,
    //                                 userConditions: {did: {$in: [app.userdetailsView.user_did]}}
    //                             });
    //                         }
    //                         else {
    //                             UserovoHelpers.alert(jQuery.i18n.map['push.no-user-token'], 'red');
    //                         }
    //                     });
    //                     if (!$('#userdata-info > tbody > tr:last-child table .user-property-push').length) {
    //                         $('<tr class="user-property-push"><td class="text-left"><span>' + components.t('userdata.push') + '</span></td><td class="text-right"></td></tr>').appendTo($('#userdata-info > tbody > tr:last-child table tbody'));
    //                     }
    //                     $('#userdata-info > tbody > tr:last-child table .user-property-push td.text-right').html(tokens.map(function(t) {
    //                         return components.t('pu.tk.' + t);
    //                     }).join('<br />'));
    //                 }
    //                 else {
    //                     $('#userdata-info > tbody > tr:last-child table .user-property-push').remove();
    //                     $('.btn-create-message').remove();
    //                     app.activeView.resetExportSubmenu();
    //                 }
    //             }
    //         }
    //     }

    var CreateMessageDropdownItemWrapper = userovoVue.views.create({
        data: function() {
            return {
                command: "CREATE_PUSH_NOTIFICATION",
                label: CV.i18n('push-notification.send-message-to-users')
            };
        },
        computed: {
            activeAppType: function() {
                return this.$store.state.userovoCommon.activeApp.type;
            },
            isDisabled: function() {
                if (this.activeAppType !== 'mobile') {
                    return true;
                }
                if (Array.isArray(userovoGlobal.member.restrict) && userovoGlobal.member.restrict.indexOf('#/messaging') !== -1 || !userovoAuth.validateCreate(featureName)) {
                    return true;
                }
                return false;
            }
        },
        template: '<el-dropdown-item :disabled="isDisabled" :command="command">{{label}}</el-dropdown-item>',
    });

    var PushNotificationDrawerWrapper = userovoVue.views.create({
        props: {
            type: {
                type: String,
                default: userovoPushNotification.service.TypeEnum.ONE_TIME
            },
            controls: {
                type: Object
            },
            from: {
                type: String,
                default: null,
            },
            queryFilter: {
                type: Object,
                default: null,
            },
        },
        data: function() {
            return {};
        },
        computed: {
            activeAppType: function() {
                return this.$store.state.userovoCommon.activeApp.type;
            },
            shouldDisplay: function() {
                if (this.activeAppType !== 'mobile') {
                    return false;
                }
                if (Array.isArray(userovoGlobal.member.restrict) && userovoGlobal.member.restrict.indexOf('#/messaging') !== -1 || !userovoAuth.validateCreate(featureName)) {
                    return false;
                }
                return true;
            }
        },
        components: {
            'push-notification-drawer': PushNotificationDrawer
        },
        template: '<push-notification-drawer v-if="shouldDisplay" :queryFilter="queryFilter" :from="from" :controls="controls" :type="type"></push-notification-drawer>',
    });

    var PushNotificationWidgetDrawer = userovoVue.views.create({
        template: CV.T('/push/templates/push-notification-widget-drawer.html'),
        props: {
            scope: {
                type: Object,
                default: function() {
                    return {};
                }
            }
        },
        data: function() {
            return {
                metrics: [
                    { label: this.i18n("dashboards.sent"), value: "sent" },
                    { label: this.i18n("dashboards.actioned"), value: "actioned" }
                ]
            };
        },
        computed: {
            enabledVisualizationTypes: function() {
                /**
                 * Allowed visualization types for this widget are time-series and number
                 */

                if (this.scope.editedObject.app_count === 'single') {
                    return ['time-series', 'number'];
                }
                else {
                    return ['time-series'];
                }
            },
            isMultipleMetric: function() {
                var multiple = false;

                if ((this.scope.editedObject.app_count === 'single') &&
                    (this.scope.editedObject.visualization === 'time-series')) {
                    multiple = true;
                }

                return multiple;
            }
        }
    });

    var PushNotificationWidgetComponent = userovoVue.views.create({
        template: CV.T('/dashboards/templates/widgets/analytics/widget.html'),
        mixins: [userovoVue.mixins.customDashboards.global, userovoVue.mixins.customDashboards.widget, userovoVue.mixins.customDashboards.apps, userovoVue.mixins.zoom, userovoVue.mixins.hasDrawers("annotation"), userovoVue.mixins.graphNotesCommand],
        components: {
            "drawer": userovoGraphNotesCommon.drawer
        },
        data: function() {
            return {
                selectedBucket: "daily",
                map: {
                    "sent": this.i18n("dashboards.sent"),
                    "actioned": this.i18n("dashboards.actioned")
                }
            };
        },
        computed: {
            title: function() {
                var autoTitle = "Push";
                return this.data.title || autoTitle;
            },
            showBuckets: function() {
                return false;
            },
            timelineGraph: function() {
                this.data = this.data || {};
                this.data.dashData = this.data.dashData || {};
                this.data.dashData.data = this.data.dashData.data || {};

                var series = [];
                var appIndex = 0;
                var multiApps = this.data.app_count === "multiple" ? true : false;

                var dates = [];

                for (var app in this.data.dashData.data) {
                    var name;
                    for (var k = 0; k < this.data.metrics.length; k++) {
                        if (multiApps) {
                            if (this.data.metrics.length > 1) {
                                name = (this.map[this.data.metrics[k]] || this.data.metrics[k]) + " " + (this.__allApps[app] && this.__allApps[app].name || "Unknown");
                            }
                            else {
                                name = (this.__allApps[app] && this.__allApps[app].name || "Unknown");
                            }
                        }
                        else {
                            name = (this.map[this.data.metrics[k]] || this.data.metrics[k]);
                        }
                        series.push({ "data": [], "name": name, "app": app, "metric": this.data.metrics[k], color: userovoCommon.GRAPH_COLORS[series.length]});
                    }

                    for (var date in this.data.dashData.data[app]) {
                        if (appIndex === 0) {
                            dates.push(date);
                        }
                        for (var kk = 0; kk < this.data.metrics.length; kk++) {
                            series[appIndex * this.data.metrics.length + kk].data.push(this.data.dashData.data[app][date][this.data.metrics[kk]] || 0);
                        }
                    }
                    appIndex++;
                }
                if (this.data.custom_period) {
                    return {
                        lineOptions: {xAxis: { data: dates}, "series": series}
                    };
                }
                else {
                    return {
                        lineOptions: {"series": series}
                    };
                }
            },
            number: function() {
                return this.calculateNumberFromWidget(this.data);
            },
            metricLabels: function() {
                this.data = this.data || {};
                var listed = [];

                for (var k = 0; k < this.data.metrics.length; k++) {
                    listed.push(this.map[this.data.metrics[k]] || this.data.metrics[k]);
                }
                return listed;
            },
            legendLabels: function() {
                var labels = {};

                var graphData = this.timelineGraph;
                var series = graphData.lineOptions.series;

                for (var i = 0; i < series.length; i++) {
                    if (!labels[series[i].app]) {
                        labels[series[i].app] = [];
                    }

                    labels[series[i].app].push({
                        appId: series[i].app,
                        color: series[i].color,
                        label: this.map[series[i].metric] || series[i].metric
                    });
                }

                return labels;
            }
        },
        methods: {
            refresh: function() {
                this.refreshNotes();
            },
            onWidgetCommand: function(event) {
                if (event === 'zoom') {
                    this.triggerZoom();
                    return;
                }
                else if (event === 'add' || event === 'manage' || event === 'show') {
                    this.graphNotesHandleCommand(event);
                    return;
                }
                else {
                    return this.$emit('command', event);
                }
            },
        },
    });



    /**
     *
     * @returns {Object} container data with create new message event handler
     */
    function getCreateNewMessageEventContainerData() {
        return {
            id: "createMessageDropdownItemWrapper",
            name: "createMessageDropdownItemWrapper",
            command: "CREATE_PUSH_NOTIFICATION",
            pluginName: "push",
            component: CreateMessageDropdownItemWrapper,
            click: function() {
                this.openDrawer("pushNotificationDrawer", {});
            }
        };
    }
    /**
     *
     * @returns {Object} container data with push notification drawer
     */
    function getDrawerContainerData() {
        return {
            id: "pushNotificationDrawer",
            name: "pushNotificationDrawer",
            pluginName: "push",
            component: PushNotificationDrawerWrapper,
            type: userovoPushNotification.service.TypeEnum.ONE_TIME,
        };
    }
    /**
     * addDrawerToDrillmainView - adds push notification drawer to drill main view.
     */
    function addDrawerToDrillMainView() {
        userovoVue.container.registerTemplate("/drill/external/templates", "/push/templates/common-components.html");
        userovoVue.container.registerData("/drill/external/events", getCreateNewMessageEventContainerData());
        userovoVue.container.registerData("/drill/external/drawers", getDrawerContainerData());
        userovoVue.container.registerData('/drill/external/drawers/data', userovoCommon.getExternalDrawerData('pushNotificationDrawer'), 'object');
    }

    /**
     * addDrawerToUserProfilesMainView - adds push notification drawer to user profiles main view.
     */
    function addDrawerToUserProfilesMainView() {
        userovoVue.container.registerTemplate("/users/external/templates", "/push/templates/common-components.html");
        userovoVue.container.registerData("/users/external/events", getCreateNewMessageEventContainerData());
        userovoVue.container.registerData("/users/external/drawers", getDrawerContainerData());
        userovoVue.container.registerData('/users/external/drawers/data', userovoCommon.getExternalDrawerData('pushNotificationDrawer'), 'object');
    }

    /**
     * addWidgetToCustomDashboard - adds push notification widget to custom dashboard
     */
    function addWidgetToCustomDashboard() {
        userovoVue.container.registerData('/custom/dashboards/widget', {
            type: 'push',
            label: CV.i18n('push-notification.title'),
            priority: 6,
            pluginName: "push",
            primary: true,
            getter: function(widget) {
                return widget.widget_type === "push";
            },
            drawer: {
                component: PushNotificationWidgetDrawer,
                getEmpty: function() {
                    return {
                        title: "",
                        feature: featureName,
                        widget_type: "push",
                        isPluginWidget: true,
                        apps: [],
                        app_count: 'single',
                        visualization: "",
                        metrics: [],
                    };
                },
                beforeLoadFn: function() {},
                beforeSaveFn: function() {}
            },
            grid: {
                component: PushNotificationWidgetComponent
            }

        });
    }

    addDrawerToDrillMainView();
    addDrawerToUserProfilesMainView();


    //userovo.view global management settings
    app.addMenuForType("mobile", "reach", {code: "push", permission: featureName, url: "#/messaging", text: "push-notification.title", icon: '<div class="logo ion-chatbox-working"></div>', priority: 10});
    addWidgetToCustomDashboard();

    if (app.configurationsView) {
        app.configurationsView.registerLabel("push", "push-notification.title");
        app.configurationsView.registerLabel("push.proxyhost", "push-notification.proxy-host");
        app.configurationsView.registerLabel("push.proxypass", "push-notification.proxy-password");
        app.configurationsView.registerLabel("push.proxyport", "push-notification.proxy-port");
        app.configurationsView.registerLabel("push.proxyuser", "push-notification.proxy-user");
    }
}());

/* global app, userovoVue, CV, userovoGlobal, UserovoHelpers, $, userovoCommon */

// if configuration view exists
if (app.configurationsView) {
    // registerLabel for two-factor-auth and two-factor-auth-global_enable
    // http://resources.count.ly/docs/shared-configurations#section-customizing-web-ui-labels
    app.configurationsView.registerLabel("two-factor-auth", "two-factor-auth.two-factor-authentication");
    app.configurationsView.registerLabel("two-factor-auth-globally_enabled", "two-factor-auth.globally_enabled");
}

var TwoFAUser = userovoVue.views.create({
    template: userovoVue.T("/two-factor-auth/templates/setup2fa_modal.html"),
    data: function() {
        if (!userovoGlobal.member.two_factor_auth) {
            userovoGlobal.member.two_factor_auth = {};
        }
        if (typeof userovoGlobal.member.two_factor_auth.enabled === "undefined") {
            userovoGlobal.member.two_factor_auth.enabled = false;
        }
        return {
            TFAsettings: userovoGlobal.member.two_factor_auth,
            dataModal: {showDialog: false},
            qrcode_html: null,
            secret_token: null,
            secret_code: null
        };
    },
    methods: {
        onChange: function(value) {
            if (value) {
                this.dataModal.showDialog = true;
                this.getQRCode();
            }
            else {
                UserovoHelpers.confirm(
                    $.i18n.map["two-factor-auth.confirm_disable"],
                    "popStyleGreen",
                    function(result) {
                        if (!result) {
                            return;
                        }
                        $.ajax({
                            type: "GET",
                            url: userovoCommon.API_PARTS.data.w + "/two-factor-auth",
                            data: {
                                method: "disable"
                            },
                            success: function() {
                                UserovoHelpers.notify({
                                    title: $.i18n.map["two-factor-auth.disable_title"],
                                    message: $.i18n.map["two-factor-auth.disable_message"],
                                    type: "ok"
                                });
                                userovoGlobal.member.two_factor_auth.enabled = false;
                            },
                            error: function(xhr) {
                                var errMessage = "";

                                try {
                                    var response = JSON.parse(xhr.responseText);
                                    errMessage = response.result || xhr.statusText;
                                }
                                catch (err) {
                                    errMessage = xhr.statusText;
                                }

                                UserovoHelpers.notify({
                                    title: $.i18n.map["two-factor-auth.faildisable_title"],
                                    message: $.i18n.prop("two-factor-auth.faildisable_message", errMessage),
                                    type: "error"
                                });
                            }
                        });
                    },
                    [$.i18n.map["common.cancel"], $.i18n.map["common.continue"]],
                    {
                        title: $.i18n.map["two-factor-auth.confirm_disable_title"],
                        image: "delete-user"
                    }
                );
            }
        },
        closeDataModal: function() {
            this.dataModal.showDialog = false;
        },
        confirmDialog: function() {
            var self = this;
            $.ajax({
                type: "GET",
                url: userovoCommon.API_PARTS.data.w + "/two-factor-auth",
                data: {
                    method: "enable",
                    secret_token: self.secret_token,
                    auth_code: self.secret_code
                },
                success: function() {
                    UserovoHelpers.notify({
                        title: $.i18n.map["two-factor-auth.setup_title"],
                        message: $.i18n.map["two-factor-auth.setup_message"],
                        type: "ok"
                    });

                    self.dataModal.showDialog = false;
                    userovoGlobal.member.two_factor_auth.enabled = true;
                },
                error: function(xhr) {
                    var errMessage = "";

                    try {
                        var response = JSON.parse(xhr.responseText);
                        errMessage = response.result || xhr.statusText;
                    }
                    catch (err) {
                        errMessage = xhr.statusText;
                    }

                    UserovoHelpers.notify({
                        title: $.i18n.map["two-factor-auth.failsetup_title"],
                        message: $.i18n.prop("two-factor-auth.failsetup_message", errMessage),
                        type: "error"
                    });
                    self.dataModal.showDialog = false;
                }
            });
        },
        getQRCode() {
            this.qrcode_html = null;
            this.secret_token = null;
            this.secret_code = null;
            $.ajax({
                type: "GET",
                url: userovoCommon.API_PARTS.data.w + '/two-factor-auth',
                data: {
                    method: "generate-qr-code",
                    "userovo-token": userovoGlobal.auth_token,
                    "Content-Type": "application/json; charset=utf-8",
                },
                success: (data) => {
                    this.qrcode_html = userovoCommon.unescapeHtml(data.qrCode);
                    this.secret_token = data.secret;
                },
                error: (xhr) => {
                    var errMessage = "";

                    try {
                        var response = JSON.parse(xhr.responseText);
                        errMessage = response.result || xhr.statusText;
                    }
                    catch (err) {
                        errMessage = xhr.statusText;
                    }

                    UserovoHelpers.notify({
                        title: $.i18n.map["two-factor-auth.failsetup_title"],
                        message: $.i18n.prop("two-factor-auth.failsetup_message", errMessage),
                        type: "error"
                    });
                }
            });
        }
    }
});

userovoVue.container.registerData("/account/settings", {
    _id: "2fa",
    title: CV.i18n('two-factor-auth.plugin-title'),
    component: TwoFAUser
});

/*app.addPageScript("/manage/users", function() {
    $("#content").on("click", "#user-table tr", function(event) {
        var $userRow = $(event.target).closest("tr"),
            userId = $userRow.attr("id"),
            $userDetails = $(event.target).closest("tr").next();

        if ($userDetails.attr("id") === undefined && userovoGlobal.member.global_admin) {
            $.ajax({
                type: "GET",
                url: userovoGlobal.path + "/i/two-factor-auth",
                data: {
                    method: "admin_check",
                    uid: userId
                },
                success: function(data) {
                    var has2FA = JSON.parse(data.result);

                    if (has2FA) {
                        $userDetails.find(".button-container a.delete-user").after('<a class="icon-button red disable-2fa-user" data-localize="two-factor-auth.disable_2fa"></a>');
                        app.localize();
                        $userDetails.find(".button-container a.disable-2fa-user").off("click").on("click", function() {
                            UserovoHelpers.confirm(
                                $.i18n.prop("two-factor-auth.confirm_disable_admin", $userDetails.find("input.username-text").val()),
                                "popStyleGreen",
                                function(result) {
                                    if (!result) {
                                        return;
                                    }

                                    $.ajax({
                                        type: "GET",
                                        url: userovoGlobal.path + "/i/two-factor-auth",
                                        data: {
                                            method: "admin_disable",
                                            uid: userId
                                        },
                                        success: function() {
                                            UserovoHelpers.notify({
                                                title: $.i18n.map["two-factor-auth.disable_title"],
                                                message: $.i18n.map["two-factor-auth.disable_user_message"],
                                                type: "ok"
                                            });

                                            $userDetails.find(".button-container a.disable-2fa-user").remove();
                                        },
                                        error: function(xhr) {
                                            var errMessage = "";

                                            try {
                                                var response = JSON.parse(xhr.responseText);
                                                errMessage = response.result || xhr.statusText;
                                            }
                                            catch (err) {
                                                errMessage = xhr.statusText;
                                            }

                                            UserovoHelpers.notify({
                                                title: $.i18n.map["two-factor-auth.faildisable_title"],
                                                message: $.i18n.prop("two-factor-auth.faildisable_message", errMessage),
                                                type: "error"
                                            });
                                        }
                                    });
                                },
                                [$.i18n.map["common.cancel"], $.i18n.map["common.continue"]],
                                {
                                    title: $.i18n.map["two-factor-auth.confirm_disable_title"],
                                    image: "delete-user"
                                }
                            );
                        });
                    }
                }
            });
        }
    });
});*/


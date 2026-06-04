/* global userovoCommon, jQuery*/
(function(userovoTokenManager, $) {
    //we will store our data here
    var _data = {};
    //Initializing model
    userovoTokenManager.initialize = function() {
        //returning promise
        return $.ajax({
            type: "GET",
            url: userovoCommon.API_URL + "/o/token/list",
            data: {},
            success: function(json) {
                //got our data, let's store it
                _data = json.result;
            },
            error: function() {
                //empty
            }
        });
    };
    //return data that we have
    userovoTokenManager.getData = function() {
        return _data;
    };

    userovoTokenManager.createToken = function(purpose, endpoint, multi, apps, ttl, callback) {
        return $.ajax({
            type: "GET",
            url: userovoCommon.API_URL + "/i/token/create",
            data: {
                "purpose": purpose,
                "endpoint": endpoint,
                "multi": multi,
                "apps": apps,
                "ttl": ttl
            },
            success: function(json) {
                //token created
                callback(null, json);
            },
            error: function(xhr, status, error) {
                callback(error);
            }
        });
    };

    userovoTokenManager.createTokenWithQuery = function(purpose, endpoint, multi, apps, ttl, callback) {
        return $.ajax({
            type: "GET",
            url: userovoCommon.API_URL + "/i/token/create",
            data: {
                "purpose": purpose,
                "endpointquery": endpoint,
                "multi": multi,
                "apps": apps,
                "ttl": ttl
            },
            success: function(json) {
                //token created
                callback(null, json);
            },
            error: function(xhr, status, error) {
                callback(error);
            }
        });
    };

    userovoTokenManager.deleteToken = function(id, callback) {
        return $.ajax({
            type: "GET",
            url: userovoCommon.API_URL + "/i/token/delete",
            data: {
                "tokenid": id
            },
            success: function() {
                callback(null, true);
            },
            error: function(xhr, status, error) {
                callback(error);
            }
        });
    };

}(window.userovoTokenManager = window.userovoTokenManager || {}, jQuery));
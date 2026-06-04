/* global userovoCommon, jQuery */
(function(userovoVersionHistoryManager, $) {
    //we will store our data here
    var _data = {};
    //Initializing model
    userovoVersionHistoryManager.initialize = function() {
        //returning promise
        return $.ajax({
            type: "GET",
            url: userovoCommon.API_URL + "/o/userovo_version",
            data: {},
            success: function(json) {
                //got our data, let's store it
                _data = json.result;
            },
            error: function(/*exception*/) {}
        });
    };
    //return data that we have
    userovoVersionHistoryManager.getData = function(detailed) {
        if (detailed) {
            return _data;
        }
        return _data.fs;
    };
}(window.userovoVersionHistoryManager = window.userovoVersionHistoryManager || {}, jQuery));
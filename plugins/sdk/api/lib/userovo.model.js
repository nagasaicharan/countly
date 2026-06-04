var countlyModel = require('../../../../api/lib/countly.model.js');

/**
* This module defines default model to handle devices data
* @module "plugins/sdk/api/lib/userovo.model"
* @extends module:api/lib/userovo.model~userovoMetric
*/

/**
* Model creator
* @returns {object} new model
*/
function create() {
    var _sdk = "";
    var userovoSDK = countlyModel.create(function(rangeArr) {
        if (rangeArr.startsWith("[" + _sdk + "]_")) {
            return rangeArr.replace("[" + _sdk + "]_", "").replace(/:/g, ".");
        }
        return "";
    });

    userovoSDK.setSDK = function(sdk) {
        _sdk = sdk;
    };
    return userovoSDK;
}
module.exports = create;
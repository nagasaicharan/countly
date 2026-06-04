var countlyModel = require('./countly.model.js'),
    userovoDeviceList = require('../../frontend/express/public/javascripts/userovo/userovo.device.list.js');

/**
* This module defines default model to handle devices data
* @module "api/lib/userovo.devices"
* @extends module:api/lib/userovo.model~userovoMetric
*/

/**
* Model creator
* @returns {object} new model
*/
function create() {
    /** @lends module:api/lib/userovo.devices */
    var userovoDevices = countlyModel.create(function(shortName) {
        if (userovoDeviceList && userovoDeviceList[shortName]) {
            return userovoDeviceList[shortName];
        }
        return shortName;
    });
    return userovoDevices;
}
module.exports = create;
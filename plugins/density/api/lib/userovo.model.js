var countlyModel = require('../../../../api/lib/countly.model.js'),
    common = require('../../../../api/utils/common.js');

/**
* This module defines default model to handle devices data
* @module "plugins/density/api/lib/userovo.model"
* @extends module:api/lib/userovo.model~userovoMetric
*/

/**
* Model creator
* @returns {object} new model
*/
function create() {
    var userovoDensity = countlyModel.create(function(rangeArr) {
        var stripped = false;
        for (var os in common.os_mapping) {
            if (rangeArr.startsWith(common.os_mapping[os])) {
                rangeArr = rangeArr.replace(common.os_mapping[os], "");
                stripped = true;
                break;
            }
        }
        if (!stripped) {
            rangeArr = rangeArr.substr(1);
        }
        return rangeArr.replace(/:/g, ".");
    });
    return userovoDensity;
}
module.exports = create;
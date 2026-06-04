var countlyModel = require('./countly.model.js'),
    userovoCommon = require('./userovo.common.js');

/**
* This module defines default model to handle event data
* @module "api/lib/userovo.event"
* @extends module:api/lib/userovo.model~userovoMetric
*/

/**
* Model creator
* @returns {object} new model
*/
function create() {
    /** @lends module:api/lib/userovo.event */
    var userovoEvent = countlyModel.create(function(val) {
        return val.replace(/:/g, ".").replace(/\[CLY\]/g, "").replace(/.\/\//g, "://");
    });
    userovoEvent.setMetrics(["c", "s", "dur"]);
    userovoEvent.setUniqueMetrics([]);

    /**
    * Get event data by periods
    * @param {object} options - options object
    * @returns {array} with event data objects
    */
    userovoEvent.getSubperiodData = function(options) {

        var dataProps = [
            { name: "c" },
            { name: "s" },
            { name: "dur" }
        ];
        options = options || {};
        return userovoCommon.extractData(userovoEvent.getDb(), userovoEvent.clearObject, dataProps, userovoCommon.calculatePeriodObject(null, options.bucket));
    };

    /**
    * Get event data by segments
    * @param {string} segment - segment for which to get data
    * @returns {array} with event data objects
    */
    userovoEvent.getSegmentedData = function(segment) {
        return userovoCommon.extractMetric(userovoEvent.getDb(), userovoEvent.getMeta(segment), userovoEvent.clearObject, [
            {
                name: segment,
                func: function(rangeArr) {
                    return rangeArr;
                }
            },
            { "name": "c" },
            { "name": "s" },
            { "name": "dur" }
        ]);
    };

    return userovoEvent;
}
module.exports = create;
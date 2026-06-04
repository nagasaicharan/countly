var countlyModel = require('./countly.model.js');
var userovoCommon = require('./userovo.common.js');
var userovoOsMapping = require('../../frontend/express/public/javascripts/userovo/userovo.device.osmapping.js');

/**
* This module defines default model to handle device_details data
* @module "api/lib/userovo.device_details"
* @extends module:api/lib/userovo.model~userovoMetric
*/

/**
* Model creator
* @returns {object} new model
*/
function create() {
    /** @lends module:api/lib/userovo.device_details */
    var userovoDeviceDetails = countlyModel.create(function(rangeArr) {
        return rangeArr.replace(/:/g, ".");
    });

    /**
     * Function to fix data based on segement for Bars
     * @param  {String} segment - name of the segment/metric to get data for, by default will use default _name provided on initialization
     * @param  {Object} rangeData - userovo standard metric data object
     * @returns {Object} - metric data object
     */
    userovoDeviceDetails.fixBarSegmentData = function(segment, rangeData) {
        var i;

        if (segment === "os") {
            var chartData = rangeData.chartData;
            for (i = 0; i < chartData.length; i++) {
                if (userovoOsMapping[chartData[i].range.toLowerCase()]) {
                    chartData[i].os = userovoOsMapping[chartData[i].range.toLowerCase()].name;
                }
            }

            chartData = userovoCommon.mergeMetricsByName(chartData, "os");
            rangeData.chartData = chartData;
        }

        return rangeData;
    };

    return userovoDeviceDetails;
}
module.exports = create;
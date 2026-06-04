var countlyModel = require('./countly.model.js'),
    userovoCommon = require('./userovo.common.js');

/**
* This module defines default model to handle users collection data
* @module "api/lib/userovo.users"
* @extends module:api/lib/userovo.model~userovoMetric
*/

/**
* Model creator
* @returns {object} new model
*/
function create() {
    /** @lends module:api/lib/userovo.users */
    var userovoSession = countlyModel.create();
    userovoSession.setMetrics(["t", "n", "u", "d", "e", "m", "p"]);
    userovoSession.setUniqueMetrics(["u", "m", "p"]);

    /**
    * Get main dashboard data, which is displayed on main dashboard
    * @returns {object} dashboard data about users and sessions
    */
    userovoSession.getSessionData = function() {
        var map = {
            t: "total_sessions",
            n: "new_users",
            u: "total_users",
            d: "total_time",
            e: "events"
        };
        var ret = {};
        var data = userovoCommon.getDashboardData(userovoSession.getDb(), ["t", "n", "u", "d", "e"], ["u"], {u: userovoSession.getTotalUsersObj().users}, {u: userovoSession.getTotalUsersObj(true).users});
        for (let i in data) {
            ret[map[i]] = data[i];
        }

        //convert duration to minutes
        ret.total_time.total /= 60;
        ret.total_time["prev-total"] /= 60;

        //calculate average duration
        var changeAvgDuration = userovoCommon.getPercentChange(
            (ret.total_sessions["prev-total"] === 0) ? 0 : ret.total_time["prev-total"] / ret.total_sessions["prev-total"],
            (ret.total_sessions.total === 0) ? 0 : ret.total_time.total / ret.total_sessions.total);
        ret.avg_time = {
            "prev-total": (ret.total_sessions["prev-total"] === 0) ? 0 : ret.total_time["prev-total"] / ret.total_sessions["prev-total"],
            "total": (ret.total_sessions.total === 0) ? 0 : ret.total_time.total / ret.total_sessions.total,
            "change": changeAvgDuration.percent,
            "trend": changeAvgDuration.trend
        };

        ret.total_time.total = userovoCommon.timeString(ret.total_time.total);
        ret.total_time["prev-total"] = userovoCommon.timeString(ret.total_time["prev-total"]);
        ret.avg_time.total = userovoCommon.timeString(ret.avg_time.total);
        ret.avg_time["prev-total"] = userovoCommon.timeString(ret.avg_time["prev-total"]);

        //calculate average events
        var changeAvgEvents = userovoCommon.getPercentChange(
            (ret.total_users["prev-total"] === 0) ? 0 : ret.events["prev-total"] / ret.total_users["prev-total"],
            (ret.total_users.total === 0) ? 0 : ret.events.total / ret.total_users.total);
        ret.avg_requests = {
            "prev-total": (ret.total_users["prev-total"] === 0) ? 0 : ret.events["prev-total"] / ret.total_users["prev-total"],
            "total": (ret.total_users.total === 0) ? 0 : ret.events.total / ret.total_users.total,
            "change": changeAvgEvents.percent,
            "trend": changeAvgEvents.trend
        };

        ret.avg_requests.total = ret.avg_requests.total.toFixed(1);
        ret.avg_requests["prev-total"] = ret.avg_requests["prev-total"].toFixed(1);

        delete ret.events;

        //delete previous period data
        for (let i in ret) {
            delete ret[i]["prev-total"];
        }
        return ret;
    };

    /**
    * Get metric data by periods
    * @param {object} options - options object (options.bucket - daily or monthly)
    * @returns {array} with metric data objects
    */
    userovoSession.getSubperiodData = function(options) {

        var dataProps = [
            { name: "t" },
            { name: "n" },
            { name: "u" },
            { name: "d" },
            { name: "e" }
        ];
        options = options || {};
        return userovoCommon.extractData(userovoSession.getDb(), userovoSession.clearObject, dataProps, userovoCommon.calculatePeriodObject(null, options.bucket));
    };
    return userovoSession;
}
module.exports = create;

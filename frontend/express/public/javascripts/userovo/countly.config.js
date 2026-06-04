/*global CommonConstructor, userovoGlobal */
(function(CommonConstructor) {
    var userovoCommon = CommonConstructor.prototype;
    /**
    * Run userovo in Debug mode without main requests to the server. Default value is false. This value is configured in userovo.config.js or over written through theme.
    * @type {boolean} 
    */
    userovoCommon.DEBUG = false;
    /**
    * Main api path to make all ajax requests to. Also takes into account path setting in config files, when userovo is run from subdirectory. This value is configured in userovo.config.js or over written through theme.
    * @type {string} 
    */
    userovoCommon.API_URL = userovoGlobal.path || "";
    /**
    * Main api path to make all ajax requests to. This value is configured in userovo.config.js or over written through theme.
    * @property {object} data - contains default read and write endpoints 
    * @property {object} data.w - path to default write endpoint /i
    * @property {object} data.r - path to default write endpoint /o
    * @property {object} apps - contains default read and write endpoints for managing apps 
    * @property {object} apps.w - path to default write endpoint /i/apps
    * @property {object} apps.r - path to default write endpoint /o/apps
    * @property {object} users - contains default read and write endpoints for managing users 
    * @property {object} users.w - path to default write endpoint /i/users
    * @property {object} users.r - path to default write endpoint /o/users
    */
    userovoCommon.API_PARTS = {
        data: {
            "w": userovoCommon.API_URL + "/i",
            "r": userovoCommon.API_URL + "/o"
        },
        apps: {
            "w": userovoCommon.API_URL + "/i/apps",
            "r": userovoCommon.API_URL + "/o/apps"
        },
        users: {
            "w": userovoCommon.API_URL + "/i/users",
            "r": userovoCommon.API_URL + "/o/users"
        }
    };
    /**
    * Amount of miliseconds on how often to refresh the dashboard. Default is 10000 or each 10 seconds. This value is configured in userovo.config.js or over written through theme.
    * @type {number} 
    */
    userovoCommon.DASHBOARD_REFRESH_MS = 10000;
    /**
    * Amount of miliseconds how long to wait for user being idle before turning off automatic dashboard refresh. Default is 3000000 or each 50 minutes. This value is configured in userovo.config.js or over written through theme.
    * @type {number} 
    */
    userovoCommon.DASHBOARD_IDLE_MS = 3000000;
    /**
    * It is a flag used to disable auto refresh.
    * @type {boolean} 
    */
    userovoCommon.DISABLE_AUTO_REFRESH = false;
    /**
    * Amount of miliseconds how often check if session is not ended. (if user changes its password and logged in in multiple windows - it gets logged out in other). Default is 30000 or each 30 seconds. This value is configured in userovo.config.js or over written through theme. 
    * @type {number} 
    */
    userovoCommon.DASHBOARD_VALIDATE_SESSION = 30000;
    /**
    * Array of colors to be used on graphs. This value is configured in userovo.config.js or over written through theme.
    * @type {array} 
    */
    userovoCommon.GRAPH_COLORS = ["#52A3EF", "#FF8700", "#0EC1B9", "#ed6262", "#edb762", "#ede262", "#62edb0", "#62beed", "#6279ed", "#c162ed", "#ed62c7", "#9A1B2F", "#E2E4E8"];
    /**
    * Enable/disable displaying city level information on dashboard. default value is true or enabled. Similarly recording of city level data can be enabled/disabled on server side. This value only controls displaying data. This value is configured in userovo.config.js or over written through theme.
    * @type {boolean} 
    */
    userovoCommon.CITY_DATA = true;
    /**
    * Append App Id to each internal dashboard hash URL, so each URL has its app context when being copied.
    * @type {boolean} 
    */
    userovoCommon.APP_NAMESPACE = true;
    /**
    * Default time period selected on dashboard until user changes it
    * @type {string} 
    */
    userovoCommon.DEFAULT_PERIOD = "30days";

}(CommonConstructor));
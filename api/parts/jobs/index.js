'use strict';

const userovoConfig = require('./../../config', 'dont-enclose');

if (require('cluster').isMaster && process.argv[1].endsWith('api/api.js') && !(userovoConfig && userovoConfig.preventJobs)) {
    module.exports = require('./manager.js');
}
else {
    module.exports = require('./handle.js');
}
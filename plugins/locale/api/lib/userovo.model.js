var countlyModel = require('../../../../api/lib/countly.model.js'),
    langs = require('../utils/langs.js');

var langmap = langs.languages;

/**
* This module defines default model to handle devices data
* @module "plugins/locale/api/lib/userovo.model"
* @extends module:api/lib/userovo.model~userovoMetric
*/

/**
* Create model
* @returns {object} new model
*/
function create() {
    var userovoLocales = countlyModel.create(function(code) {
        if (langmap && langmap[code]) {
            return langmap[code].englishName;
        }
        else {
            return code;
        }
    });
    return userovoLocales;
}
module.exports = create;
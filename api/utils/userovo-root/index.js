var path = require('path');

/**
 * Resolves the given relative path to absolute from Userovo repository root path.
 * @param {string} relativePath The path relative to Userovo root directory.
 * @returns {string} The absolute path resolved for the given relative path.
 */
function fromUserovoRoot(relativePath) {
    return path.join(__dirname, '../../../', relativePath);
}

module.exports = fromUserovoRoot;

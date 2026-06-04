const path = require('path');
const userovoDir = __dirname;
const puppeteerInstallPath = path.join(userovoDir, '.cache', 'puppeteer');
/**
* @type {import("puppeteer").Configuration}
*/
module.exports = {
    // Download Chrome (default `skipDownload: false`)
    chrome: {
        skipDownload: false,
    },
    cacheDirectory: puppeteerInstallPath,
};
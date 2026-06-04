/**
 * The last created JSON data of timezonedb version is: 2020-10-22 `https://timezonedb.com/date.txt`
 * In case the `API_KEY` is invalid, please register with a new user.
 * If the API is not responding, check it here: `https://timezonedb.com/status` In that case, if API is broken, you can download it directly: `https://timezonedb.com/download`
 * Alternative timezones source: `https://raw.githubusercontent.com/moment/moment-timezone/develop/data/meta/latest.json`
 * That’s the script as per the scenario should create two JSON files these UI and Server Side and names is `userovo.views.json` and `app.json` and main JavaScript file would be into `utils` directory which named is `timezones.js`
 * You can use `npm run generate` or `yarn generate` command for execute script.
 */

(async() => {
    const moment = require("moment-timezone");
    const fetch = require("node-fetch");
    const fs = require("fs");

    let userovoTimezones = {};
    let countryNameArr = [];

    const FORMAT = "json"; // or xml
    const API_KEY = "OR4BCX2AS2DM";
    const PROTOCOL = "https";
    const DOMAIN = "api.timezonedb.com";
    const URI = `${PROTOCOL}://${DOMAIN}/v2.1/list-time-zone?key=${API_KEY}&format=${FORMAT}`;
    const { zones } = await (await fetch(URI)).json();

    zones.forEach((e) => {
        const countryCode = e.countryCode;
        const zoneCountryNameObject = {[`(GMT${moment().tz(e.zoneName).format("Z")}) ${e.zoneName.split("/")[1]}`]: e.zoneName};
        if (Object.prototype.hasOwnProperty.call(userovoTimezones, countryCode)) {
            userovoTimezones[countryCode].z.push(zoneCountryNameObject);
        }
        else {
            userovoTimezones[countryCode] = {};
            userovoTimezones[countryCode].n = e.countryName;
            userovoTimezones[countryCode].z = [];
            userovoTimezones[countryCode].z.push(zoneCountryNameObject);
        }
        // for server side
        countryNameArr.push(e.zoneName);
    });

    fs.writeFile("userovo.views.json", JSON.stringify(userovoTimezones), (err) => err && console.log(`userovo.views.js error: ${err}`));
    fs.writeFile("apps.json", JSON.stringify(countryNameArr), (err) => err && console.log(`app.json error: ${err}`));
})();

//from mongodb-uri
var dbObject = {};
function _parseAddress(address, uriObject) {
    uriObject.hosts = [];
    address.split(',').forEach(function(h) {
        var i = h.indexOf(':');
        if (i >= 0) {
            uriObject.hosts.push(
                {
                    host: decodeURIComponent(h.substring(0, i)),
                    port: parseInt(h.substring(i + 1))
                }
            );
        }
        else {
            uriObject.hosts.push({ host: decodeURIComponent(h) });
        }
    });
};

function parse(uri) {

    var uriObject = {};

    var i = uri.indexOf('://');
    if (i < 0) {
        throw new Error('No scheme found in URI ' + uri);
    }
    uriObject.scheme = uri.substring(0, i);
    if (this.scheme && this.scheme !== uriObject.scheme) {
        throw new Error('URI must begin with ' + this.scheme + '://');
    }
    var rest = uri.substring(i + 3);

    i = rest.indexOf('@');
    if (i >= 0) {
        var credentials = rest.substring(0, i);
        rest = rest.substring(i + 1);
        i = credentials.indexOf(':');
        if (i >= 0) {
            uriObject.username = decodeURIComponent(credentials.substring(0, i));
            uriObject.password = decodeURIComponent(credentials.substring(i + 1));
        }
        else {
            uriObject.username = decodeURIComponent(credentials);
        }
    }

    i = rest.indexOf('?');
    if (i >= 0) {
        var options = rest.substring(i + 1);
        rest = rest.substring(0, i);
        uriObject.options = {};
        options.split('&').forEach(function(o) {
            var iEquals = o.indexOf('=');
            uriObject.options[decodeURIComponent(o.substring(0, iEquals))] = decodeURIComponent(o.substring(iEquals + 1));
        });
    }

    i = rest.indexOf('/');
    if (i >= 0) {
        // Make sure the database name isn't the empty string
        if (i < rest.length - 1) {
            uriObject.database = decodeURIComponent(rest.substring(i + 1));
        }
        rest = rest.substring(0, i);
    }

    _parseAddress(rest, uriObject);

    return uriObject;

};

load("../../../frontend/express/config.js");

if (typeof userovoConfig.mongodb === "string") {
    var uriObject = parse(userovoConfig.mongodb);
    dbObject.name = uriObject.database;

    for (var i = 0; i < uriObject.hosts.length; i++) {
        if (uriObject.hosts[i].port) {
            uriObject.hosts[i] = uriObject.hosts[i].host + ":" + uriObject.hosts[i].port;
        }
        else {
            uriObject.hosts[i] = uriObject.hosts[i].host;
        }
    }
    dbObject.host = uriObject.hosts.join(",");

    if (uriObject.options && uriObject.options.replicaSet) {
        dbObject.host = uriObject.options.replicaSet + "/" + dbObject.host;
    }

    dbObject.username = uriObject.username;
    dbObject.password = uriObject.password;
}
else {
    dbObject.name = userovoConfig.mongodb.db || 'userovo';
    if (typeof userovoConfig.mongodb.replSetServers === 'object') {
        //mongodb://db1.example.net,db2.example.net:2500/?replicaSet=test
        dbObject.host = userovoConfig.mongodb.replSetServers.join(",");
        if (userovoConfig.mongodb.replicaName) {
            dbObject.host = userovoConfig.mongodb.replicaName + "/" + dbObject.host;
        }
    }
    else {
        dbObject.host = userovoConfig.mongodb.host + ':' + userovoConfig.mongodb.port;
    }
    if (userovoConfig.mongodb.username && userovoConfig.mongodb.password) {
        dbObject.username = userovoConfig.mongodb.username;
        dbObject.password = userovoConfig.mongodb.password;
    }
}
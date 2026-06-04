/*global store, userovoCommon, userovoTaskManager, $, jQuery, app*/
(function(userovoDBviewer) {

    //Private Properties
    var _data = {},
        _collections = {},
        _document = {};

    //Public Methods
    userovoDBviewer.initialize = function(app_id) {


        if (typeof app_id === "object") {
            app_id = app_id._id;
        }

        var data = {};


        if (app_id && app_id !== "all") {
            data.app_id = app_id;
        }

        if ((app_id === "all" && store.get('dbviewer_selected_app')) && store.get('dbviewer_selected_app') !== "all") {
            data.app_id = store.get('dbviewer_selected_app')._id;
        }

        return $.ajax({
            type: "GET",
            url: userovoCommon.API_URL + "/o/db",
            data: data,
            success: function(json) {
                _data = json;
                for (var i = 0; i < _data.length; i++) {
                    if (_data[i].collections) {
                        var list = [];
                        for (var j in _data[i].collections) {
                            list.push(j);
                        }
                        list.sort(function(a, b) {
                            if (a < b) {
                                return -1;
                            }
                            if (a > b) {
                                return 1;
                            }
                            return 0;
                        });
                        _data[i].list = list;
                    }
                }
            }
        });
    };

    userovoDBviewer.loadCollections = function(db, collection, page, filter, limit, sort, projection, isSort, isIndexRequest) {
        limit = limit || 20;
        var skip = (page - 1) * limit;
        var requestData = {
            dbs: db,
            collection: collection,
            filter: filter || "{}",
            limit: limit,
            sort: (isSort) ? (typeof sort === "string") ? sort : JSON.stringify(sort) : "{}",
            skip: skip
        };
        if (projection) {
            requestData.projection = (typeof projection === "string") ? projection : JSON.stringify(projection);
        }
        if (isIndexRequest) {
            requestData.action = "get_indexes";
        }
        return $.ajax({
            type: "GET",
            url: userovoCommon.API_URL + '/o/db/',
            data: requestData,
            success: function(json) {
                _collections = json;
            }
        });
    };

    userovoDBviewer.executeAggregation = function(db, collection, aggregation, app_id, task_id, callback) {
        if (task_id) {
            return $.when(userovoTaskManager.fetchResult(task_id, function(json) {
                callback(json);
            }));
        }
        else {
            return $.ajax({
                type: "GET",
                url: userovoCommon.API_URL + "/o/db",
                data: {
                    dbs: db,
                    collection: collection,
                    aggregation: aggregation,
                    app_id: app_id,
                    type: "json",
                    "preventRequestAbort": true
                },
                success: function(json) {
                    if (json.aaData && json.aaData.task_id) {
                        app.recordEvent({
                            "key": "move-to-report-manager",
                            "count": 1,
                            "segmentation": { type: "dbviewer" }
                        });
                        userovoTaskManager.monitor(json.aaData.task_id);
                        callback(false, false);
                    }
                    else {
                        callback(false, json);
                    }
                },
                error: function(error) {
                    callback(error, false);
                }
            });
        }
    };

    userovoDBviewer.loadDocument = function(db, collection, id) {
        return $.ajax({
            type: "GET",
            url: userovoCommon.API_URL + "/o/db",
            data: {
                dbs: db,
                collection: collection,
                document: id
            },
            success: function(json) {
                _document = json;
            }
        });
    };

    userovoDBviewer.getData = function() {
        return _data;
    };

    userovoDBviewer.getCollections = function() {
        return _collections;
    };

    userovoDBviewer.getDocument = function() {
        return _document;
    };

    userovoDBviewer.getName = function(db, collection) {
        var currentDb = _data.find(function(dbObj) {
            return dbObj.name === db;
        }) || {};
        var [key] = Object.entries(currentDb.collections || {}).find(function([, value]) {
            return value === collection;
        });
        return key || collection;
    };

    userovoDBviewer.getMongoTopData = function(callback) {
        return $.ajax({
            type: "GET",
            url: userovoCommon.API_URL + '/o/db/mongotop',
            data: {
                "app_id": userovoCommon.ACTIVE_APP_ID
            },
            success: function(json) {
                if (callback) {
                    callback(json);
                }
            },
            error: function() {
                if (callback) {
                    callback(false);
                }
            }
        });
    };
    userovoDBviewer.getMongoStatData = function(callback) {
        return $.ajax({
            type: "GET",
            url: userovoCommon.API_URL + '/o/db/mongostat',
            data: {
                "app_id": userovoCommon.ACTIVE_APP_ID
            },
            success: function(json) {
                if (callback) {
                    callback(json);
                }
            },
            error: function() {
                if (callback) {
                    callback(false);
                }
            }
        });
    };
}(window.userovoDBviewer = window.userovoDBviewer || {}, jQuery));
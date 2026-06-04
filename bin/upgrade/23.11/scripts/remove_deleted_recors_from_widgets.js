var plugins = require('../../../../plugins/pluginManager');
const dashboard = require('../../../../plugins/dashboards/api/parts/dashboards.js');

async function recheckFunnelWidgets(userovoDb) {
    console.log("Detecting deleted data for funnels...");

    const widgets = await userovoDb.collection('widgets').find({ widget_type: 'funnels', funnel_type: { $exists: true, $ne: [] } }, { funnel_type: 1 }).toArray();
    if (!widgets || !widgets.length) {
        console.log("No widgets found.");
        return;
    }
    const funnelIdsInWidgets = widgets.map(widget => widget.funnel_type[0].split('***')[1]);
    const existingFunnels = await userovoDb.collection('funnels').find({ _id: { $in: funnelIdsInWidgets } }, { _id: 1, app_id: 1 }).toArray();
    
    const formattedExistingFunnels = existingFunnels.map(funnel => funnel.app_id + "***" + funnel._id.toString());
    const missingFunnelIds = widgets.filter(function(result) {
        return !formattedExistingFunnels.includes(result.funnel_type[0]);
    }).map(function(result) {
        return result.funnel_type[0];
    });

    if (missingFunnelIds.length) {
        const matchOperator = {
            widget_type: "funnels",
            "funnel_type": {
                $in: missingFunnelIds
            }
        };

        try {
           return await dashboard.removeDeletedRecordsFromWidgets({member: {username: 'unknown'}}, matchOperator, userovoDb);
        }
        catch (error) {
            console.log('Error while sending a request: ', error);
        }
    }
    else {
        console.log("No deleted funnels found in widgets.");
    }
}

async function recheckFormulasWidgets(userovoDb) {
    console.log("Detecting deleted data for formulas...");

    const widgets = await userovoDb.collection('widgets').find({ widget_type: 'formulas', cmetric_refs: { $exists: true, $ne: [] } }, { "cmetric_refs._id": 1 }).toArray();
    if (!widgets || !widgets.length) {
        console.log("No widgets found.");
        return;
    }
    const ids = widgets.map(item => userovoDb.ObjectID(item.cmetric_refs[0]._id));
    const existingFormulas = await userovoDb.collection('calculated_metrics').find({ _id: { $in: ids } }, { _id: 1 }).toArray();

    const missingFormulasIds = widgets.filter(widget => {
        return !existingFormulas.some(formula => String(formula._id) === widget.cmetric_refs[0]._id);
    }).map(function(result) {
        return result.cmetric_refs[0]._id;
    });

    if (missingFormulasIds.length) {
        const matchOperator = {
            widget_type: "formulas",
            "cmetric_refs": {
                $elemMatch: {
                    _id: {
                        $in: missingFormulasIds
                    }
                }
            }
        };

        try {
            return await dashboard.removeDeletedRecordsFromWidgets({member: {username: 'unknown'}}, matchOperator, userovoDb);
        }
        catch (error) {
            console.log('Error while sending a request: ', error);
        }
    }
    else {
        console.log("No deleted formulas found in widgets.");
    }
}

async function recheckManuallyDeletedDrillBookmarks(userovoDb, userovoDrillDb) {
    console.log("Detecting manually deleted saved queries for drill...");

    const widgets = await userovoDb.collection('widgets').find({ widget_type: 'drill', drill_query: { $exists: true, $ne: [] } }).toArray();
    if (!widgets || !widgets.length) {
        console.log("No widgets found.");
        return;
    }
    const drillQueryIds = widgets.reduce((acc, widget) => {
        return acc.concat(widget.drill_query.map(query => userovoDb.ObjectID(query._id).toString()));
    }, []);
    const existingBookmarks = await userovoDrillDb.collection('drill_bookmarks').find({ _id: { $in: drillQueryIds.map(id => userovoDb.ObjectID(id)) } }, { _id: 1 }).toArray();
    const existingBookmarkIds = existingBookmarks.map(drill => drill._id.toString());
    const deletedBookmarkIds = drillQueryIds.filter(id => {
        return !existingBookmarkIds.includes(id);
    });

    try {
        for (let widget of widgets) {
            for (let queryId of deletedBookmarkIds) {
                let reports = await userovoDb.collection("long_tasks").find({ "linked_to._issuer": 'wqm:drill', "linked_to._id": queryId }, { _id: 1 }).toArray();
                let reportIds = reports.map((x) => x._id);
                await userovoDb.collection('widgets').updateOne(
                    { _id: widget._id },
                    { $pull: { drill_query: { _id: queryId }, drill_report: { $in: reportIds } } }
                );
            }
        }
    }
    catch (error) {
        console.log('Error while sending a request: ', error);
    }
}


async function recheckDrillWidgets(userovoDb) {
    console.log("Detecting deleted data for drill...");
    const matchOperator = {
        "widget_type": "drill",
        "drill_query": { $size: 0 }
    };

    try {
        return await dashboard.removeDeletedRecordsFromWidgets({member: {username: 'unknown'}}, matchOperator, userovoDb);
    }
    catch (error) {
        console.log('Error while sending a request: ', error);
    }
}


plugins.dbConnection().then(async(userovoDb) => {
    plugins.dbConnection("userovo_drill").then(async (userovoDrill) => {
        try {
            await recheckFunnelWidgets(userovoDb);
        }
        catch (error) {
            console.log('Error in recheckFunnelWidgets:', error);
        }

        try {
            await recheckFormulasWidgets(userovoDb);
        }
        catch (error) {
            console.log('Error in recheckFormulasWidgets:', error);
        }
        try {
            await recheckManuallyDeletedDrillBookmarks(userovoDb, userovoDrill);
        }
        catch (error) {
            console.log('Error in recheckDrillWidgets:', error);
        }
        try {
            await recheckDrillWidgets(userovoDb);
        }
        catch (error) {
            console.log('Error in recheckDrillWidgets:', error);
        }
        finally {
            userovoDb.close();
            userovoDrill.close();
        }
    });
});

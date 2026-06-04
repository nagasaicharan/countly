#!/bin/bash

VER="22.03"

CONTINUE="$(userovo check before upgrade db "$VER")"

if [ "$CONTINUE" != "1" ] && [ "$1" != "combined" ]
then
    echo "Database is already up to date with $VER"
    read -r -p "Are you sure you want to run this script? [y/N] " response
    if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]
    then
        CONTINUE=1
    fi
fi

if [ "$CONTINUE" == "1" ]
then
    echo "Running database modifications"
    DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )/../.." && pwd )"
    CUR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
    
    #default setting for meta now
    userovo config "drill.record_meta" "false"

    if [ "$1" != "combined" ]; then
        #upgrade plugins
        userovo plugin upgrade white-labeling
        userovo plugin upgrade sources
        userovo plugin upgrade two-factor-auth
        userovo plugin upgrade web
        userovo plugin upgrade push
        userovo plugin upgrade hooks
        userovo plugin upgrade drill
        
        #enable new plugins
        userovo plugin enable data-manager
        userovo plugin enable heatmaps
        
        #disable old plugins
        userovo plugin disable EChartMap
        userovo plugin disable restrict
        userovo plugin disable assistant
    fi

    #run upgrade scripts
    nodejs "$DIR/scripts/loadCitiesInDb.js"
    nodejs "$CUR/scripts/fix_bookmarks.js"
    nodejs "$CUR/scripts/fix_cohorts_appID.js"
    nodejs "$CUR/scripts/group_permission_generator.js"
    nodejs "$CUR/scripts/member_permission_generator.js"
    nodejs "$CUR/scripts/push_all_things.js"
    nodejs "$CUR/scripts/update_app_users.js"
    nodejs "$CUR/scripts/update_widgets_reports.js"
    nodejs "$CUR/scripts/clear_old_report_data.js"
    nodejs "$CUR/scripts/mark_upgraded_custom_dashboards.js"
    
    #change config settings
    userovo config "api.batch_on_master" null --force
    userovo config "api.batch_read_on_master" null --force
    userovo config "funnels.funnel_caching" true --force
    
    #add indexes
    nodejs "$DIR/scripts/add_indexes.js"
    
    if [ "$1" != "combined" ]; then
        userovo upgrade;
    fi

    #call after check
    userovo check after upgrade db "$VER"
elif [ "$CONTINUE" == "0" ]
then
    echo "Database is already upgraded to $VER"
elif [ "$CONTINUE" == "-1" ]
then
    echo "Database is upgraded to higher version"
else
    echo "Unknown ugprade state: $CONTINUE"
fi

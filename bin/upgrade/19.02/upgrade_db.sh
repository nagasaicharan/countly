#!/bin/bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )/../.." && pwd )"
CUR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

if [ "$1" != "combined" ]; then
    #upgrade plugins
    userovo plugin upgrade retention_segments
    userovo plugin upgrade alerts
    userovo plugin upgrade push
    userovo plugin upgrade assistant
    userovo plugin upgrade attribution
    userovo plugin upgrade crashes
    userovo plugin upgrade flows
    userovo plugin upgrade plugin-upload
    userovo plugin upgrade views
    
    #enable new plugins
    userovo plugin enable remote-config
fi

userovo config "views.view_limit" 50000

#run upgrade scripts
nodejs "$CUR/scripts/change_alerts_schedule.js"
nodejs "$CUR/scripts/clear_jobs.js"
nodejs "$CUR/scripts/drop_sessions.js"
nodejs "$CUR/scripts/fix_report_manager.js"
nodejs "$CUR/scripts/updateViews.js"

#add indexes
nodejs "$DIR/scripts/add_indexes.js"
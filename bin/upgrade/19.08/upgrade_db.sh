#!/bin/bash

echo "Running database modifications"

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )/../.." && pwd )"
CUR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

if [ "$1" != "combined" ]; then
    #upgrade plugins
    userovo plugin upgrade crashes
    userovo plugin upgrade push
    userovo plugin upgrade systemlogs
    userovo plugin disable live
    userovo plugin enable concurrent_users
    userovo plugin enable formulas
    userovo plugin enable ab-testing
    #replace totp with two-factor-aut
    STATE=$(userovo plugin status  totp);
    if [ "$STATE" == "enabled" ] 
    then
        userovo plugin disable  totp ;
        userovo plugin enable two-factor-auth ;
    fi
fi

#run upgrade scripts
nodejs "$CUR/scripts/live_concurrent.js"
nodejs "$CUR/scripts/notes_upgrade.js"
nodejs "$CUR/scripts/update_crashes.js"
nodejs "$CUR/scripts/migrate_totp.js"
nodejs "$CUR/scripts/push.js"

#add indexes
nodejs "$DIR/scripts/add_indexes.js"
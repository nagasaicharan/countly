#!/bin/bash

VER="20.11"

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
        userovo plugin upgrade star-rating
        userovo plugin upgrade users
        userovo plugin upgrade consolidate
        userovo plugin upgrade two-factor-auth
        userovo plugin upgrade web
        userovo plugin upgrade active_directory
        userovo plugin upgrade crash_symbolication
        userovo plugin upgrade concurrent_users
        
        #enable new plugins
        userovo plugin enable activity-map
        userovo plugin enable config-transfer
        userovo plugin enable consolidate
        userovo plugin enable data-manager
        userovo plugin enable hooks
        userovo plugin enable surveys
    fi

    #run upgrade scripts
    nodejs "$CUR/scripts/removeUserProps.js"
    nodejs "$CUR/scripts/update_app_users.js"
    nodejs "$CUR/scripts/cleanup_concurrent.js"
    
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
#!/bin/bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )/../.." && pwd )"

if [ "$1" != "combined" ]; then
    #upgrade plugins
    userovo plugin upgrade push
    userovo plugin upgrade revenue
    userovo plugin upgrade attribution
    userovo plugin upgrade crashes
    userovo plugin upgrade errorlogs
    userovo plugin upgrade star-rating
    userovo plugin upgrade logger
    userovo plugin upgrade populator
    userovo plugin upgrade funnels
    userovo plugin upgrade data_migration
    userovo plugin upgrade retention_segments
    userovo plugin enable onboarding
fi

#run upgrade scripts
nodejs "$DIR/upgrade/18.08/scripts/tokens_fix_owner.js"
nodejs "$DIR/upgrade/18.01.1/scripts/push_clear.js"

#add indexes
nodejs "$DIR/scripts/add_indexes.js"

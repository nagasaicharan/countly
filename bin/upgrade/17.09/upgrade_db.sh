#!/bin/bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )/../.." && pwd )"

#rename config property
WARN="$(userovo config "logs.warning")"
userovo config "logs.warning" null
userovo config "logs.warn" "$WARN"

if [ "$1" != "combined" ]; then
    #upgrade existing plugins
    userovo plugin upgrade push
    
    #enable new plugins
    userovo plugin enable alerts
    userovo plugin enable cohorts
    userovo plugin enable crash_symbolication
    userovo plugin enable groups
    userovo plugin enable plugin-upload
    userovo plugin enable white-labeling
fi

#add indexes
nodejs "$DIR/scripts/add_indexes.js"


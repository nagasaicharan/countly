#!/bin/bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )/../.." && pwd )"

if [ "$1" != "combined" ]; then
    #upgrade existing plugins
    userovo plugin upgrade push
    
    #enable new plugins
    if [ ! -f "$DIR/../plugins/plugins.ee.json" ]; then
        userovo plugin enable video-intelligence-monetization
    fi
    userovo plugin enable alerts
fi

#add indexes
nodejs "$DIR/scripts/add_indexes.js"
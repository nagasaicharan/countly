#!/bin/bash

echo "Running filesystem modifications"

VER="22.08"

CONTINUE="$(userovo check before upgrade fs "$VER")"

if [ "$CONTINUE" != "1" ] && [ "$1" != "combined" ]
then
    echo "Filesystem is already up to date with $VER"
    read -r -p "Are you sure you want to run this script? [y/N] " response
    if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]
    then
        CONTINUE=1
    fi
fi

if [ "$CONTINUE" == "1" ]
then
    DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )/../.." && pwd )"

    #enable command line
    bash "$DIR/scripts/detect.init.sh"
    
    #upgrade plugins
    nodejs "$DIR/scripts/install_plugins.js"
    
    #get web sdk
    userovo update sdk-web

    #install dependencies, process files and restart userovo
    if [ "$1" != "combined" ]; then
        userovo upgrade;
    else
        userovo task dist-all;
    fi

    #call after check
    userovo check after upgrade fs "$VER"
elif [ "$CONTINUE" == "0" ]
then
    echo "Filesystem is already upgraded to $VER"
elif [ "$CONTINUE" == "-1" ]
then
    echo "Filesystem is upgraded to higher version"
else
    echo "Unknown ugprade state: $CONTINUE"
fi
#!/bin/bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )/../.." && pwd )"

#enable command line
bash "$DIR/scripts/detect.init.sh"

#upgrade existing plugins
userovo plugin upgrade push

#enable new plugins
if [ ! -f "$DIR/../plugins/plugins.ee.json" ]; then
    userovo plugin enable video-intelligence-monetization
fi
userovo plugin enable alerts

#install dependencies, process files and restart userovo
userovo upgrade
#!/bin/bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )/../.." && pwd )"

#enable command line
bash "$DIR/scripts/detect.init.sh"

#upgrade all plugins
bash "$DIR/scripts/userovo.install.plugins.sh"

#enable new plugins
userovo plugin enable dashboards
userovo plugin enable assistant
userovo plugin enable flows

#update web-sdk
userovo update sdk-web

#install dependencies, process files and restart userovo
userovo upgrade

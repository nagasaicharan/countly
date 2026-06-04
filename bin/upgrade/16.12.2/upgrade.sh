#!/bin/bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )/../.." && pwd )"

#enable command line
bash "$DIR/scripts/detect.init.sh"

#upgrade plugins
userovo plugin upgrade push

userovo update sdk-web

#add indexes
nodejs "$DIR/scripts/add_indexes.js"

#install dependencies, process files and restart userovo
userovo upgrade
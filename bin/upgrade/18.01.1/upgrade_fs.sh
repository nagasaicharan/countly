#!/bin/bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )/../.." && pwd )"

#enable command line
bash "$DIR/scripts/detect.init.sh"

#upgrade existing plugins
userovo plugin upgrade crashes
userovo plugin upgrade views
userovo plugin upgrade users

#install dependencies, process files and restart userovo
userovo upgrade
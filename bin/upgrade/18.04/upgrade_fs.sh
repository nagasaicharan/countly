#!/bin/bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )/../.." && pwd )"

#enable command line
bash "$DIR/scripts/detect.init.sh"

#upgrade existing plugins
userovo plugin upgrade push

#enable new plugins
userovo plugin enable compliance-hub

#install dependencies, process files and restart userovo
userovo upgrade
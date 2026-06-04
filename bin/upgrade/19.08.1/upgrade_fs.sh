#!/bin/bash

echo "Running filesystem modifications"

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )/../.." && pwd )"

#enable command line
bash "$DIR/scripts/detect.init.sh"

#update plugins
userovo plugin upgrade crashes
userovo plugin upgrade push
(cd "$DIR/../plugins/push/api/parts/apn" && sudo npm install --unsafe-perm)

#udpate packages
(cd "$DIR" && sudo npm update --unsafe-perm)

#update sdk
userovo update sdk-web

#install dependencies, process files and restart userovo
userovo upgrade
#!/bin/bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )/../.." && pwd )"

#enable command line
bash "$DIR/scripts/detect.init.sh"

#upgrade config
mv "$DIR/../frontend/express/public/javascripts/userovo/userovo.config.js" "$DIR/../frontend/express/public/javascripts/userovo/userovo.config.backup.19.01.js"
cp -n "$DIR/../frontend/express/public/javascripts/userovo/userovo.config.sample.js" "$DIR/../frontend/express/public/javascripts/userovo/userovo.config.js"

#remove predefined locale file, it should fallback to default one
rm -rf "$DIR/../frontend/express/public/localization/min/locale_en.properties"

#remove outdated connect-mongoskin
rm -rf "$DIR/../node_modules/connect-mongoskin/"

#upgrade plugins
userovo upgrade
userovo plugin upgrade retention_segments
userovo plugin upgrade alerts
userovo plugin upgrade push
(cd "$DIR/../plugins/push/api/parts/apn" && npm install --unsafe-perm)
userovo plugin upgrade assistant
userovo plugin upgrade attribution
userovo plugin upgrade crashes
userovo plugin upgrade flows
userovo plugin upgrade plugin-upload
userovo plugin upgrade views

#enable new plugins
userovo plugin enable remote-config

#install dependencies, process files and restart userovo
userovo upgrade
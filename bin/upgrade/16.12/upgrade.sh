#!/bin/bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )/../.." && pwd )"

#upgrade nodejs
if [ -f /etc/redhat-release ]; then
	curl -sL https://rpm.nodesource.com/setup_6.x | bash -
	yum install -y nodejs
fi

if [ -f /etc/lsb-release ]; then
	wget -qO- https://deb.nodesource.com/setup_6.x | bash -
	apt-get -y --force-yes install nodejs || (echo "Failed to install nodejs." ; exit)
fi

#enable command line
bash "$DIR/scripts/detect.init.sh"

#remove previous dependencies, as they need to be rebuild for new nodejs version
rm -rf "$DIR/../node_modules"
userovo upgrade

#upgrade graph colors for new UI
mv "$DIR/../frontend/express/public/javascripts/userovo/userovo.config.js" "$DIR/../frontend/express/public/javascripts/userovo/userovo.config.backup.js"
cp -n "$DIR/../frontend/express/public/javascripts/userovo/userovo.config.sample.js" "$DIR/../frontend/express/public/javascripts/userovo/userovo.config.js"

pkill -f executor.js

#upgrade plugins
userovo plugin upgrade push
userovo plugin upgrade systemlogs
userovo plugin upgrade errorlogs
userovo plugin upgrade web
userovo plugin upgrade geo

userovo update sdk-web

#add new plugins
userovo plugin enable compare
userovo plugin enable server-stats
userovo plugin enable slipping-away-users
userovo plugin enable star-rating

#add indexes
nodejs "$DIR/scripts/add_indexes.js"

#install dependencies, process files and restart userovo
userovo upgrade
#!/bin/bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )/../.." && pwd )"

#enable command line
bash "$DIR/scripts/detect.init.sh"

#change nginx config
echo "Changing nginx.conf file to increase upload limit"
echo "You can find your old conf file at $DIR/config/nginx.conf.backup.pre.17.09"
cp /etc/nginx/nginx.conf "$DIR/config/nginx.conf.backup.pre.17.09"
cp "$DIR/config/nginx.conf" /etc/nginx/nginx.conf
sudo nginx -s reload

#upgrade existing plugins
userovo plugin upgrade push

#enable new plugins
userovo plugin enable alerts
userovo plugin enable cohorts
userovo plugin enable crash_symbolication
userovo plugin enable groups
userovo plugin enable plugin-upload
userovo plugin enable white-labeling

#update web-sdk
userovo update sdk-web

#install dependencies, process files and restart userovo
userovo upgrade
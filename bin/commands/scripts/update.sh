#!/bin/bash
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

usage (){
    echo "";
    echo "userovo update usage:";
    echo "    userovo update translations   # get latest translation files";
    echo "    userovo update geoip          # get latest geoip-lite translation files";
    echo "    userovo update devices        # get latest list of device ids to device names";
    echo "    userovo update sdk-web        # get latest version of web sdk";
} 
if [ "$1" = "translations" ]; then
    nodejs "$DIR/update_translations.js" ;
    (cd "$DIR/../../../" ; userovo task locales ;)
elif [ "$1" = "geoip" ]; then
    (cd "$DIR/../../../node_modules/geoip-lite" ; npm run-script updatedb ;)
elif [ "$1" = "devices" ]; then
    wget -nv --no-check-certificate https://raw.githubusercontent.com/Userovo/userovo-localization/master/data/userovo.device.list.js -O "$DIR/../../../frontend/express/public/javascripts/userovo/userovo.device.list.js"
elif [ "$1" = "sdk-web" ]; then
    mkdir -p "$DIR/../../../frontend/express/public/sdk/web";
    #SERVER_VERSION="$(userovo version)";
    #LATEST_SDK="$(wget -qO- https://api.github.com/repos/userovo/userovo-sdk-web/releases | grep tag_name | grep "$SERVER_VERSION" | head -n 1 | cut -d '"' -f 4)";
    (cd "$DIR/../../../" ;
    #npm install userovo-sdk-web@$LATEST_SDK ;
    cp -rf "$DIR/../../../"node_modules/userovo-sdk-web/lib/* "$DIR/../../../frontend/express/public/sdk/web/"
    )
else
    usage ;
fi
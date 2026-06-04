#!/bin/bash

echo "Running filesystem modifications"

VER="20.04"

CONTINUE="$(userovo check before upgrade fs "$VER")"

if [ "$CONTINUE" != "1" ] && [ "$1" != "combined" ]
then
    echo "Filesystem is already up to date with $VER"
    read -r -p "Are you sure you want to run this script? [y/N] " response
    if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]
    then
        CONTINUE=1
    fi
fi

if [ "$CONTINUE" == "1" ]
then
    DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )/../.." && pwd )"
    CUR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

    #upgrade nodejs
    if [ -f /etc/redhat-release ]; then
        curl -sL https://rpm.nodesource.com/setup_10.x | bash -
        yum clean all
        yum remove -y nodejs
        yum install -y nodejs
    fi

    if [ -f /etc/lsb-release ]; then
        sudo dpkg --configure -a
        wget -qO- https://deb.nodesource.com/setup_10.x | bash -
        apt-get -f -y install
        apt-get -y --force-yes install nodejs || (echo "Failed to install nodejs." ; exit)
    fi

    #enable command line
    bash "$DIR/scripts/detect.init.sh"


    #remove predefined locale file, it should fallback to default one
    rm -rf "$DIR/../frontend/express/public/localization/min/locale_en.properties"

    #remove previous dependencies, as they need to be rebuild for new nodejs version
    rm -rf "$DIR/../node_modules"
    
    #remove previous package-lock.json
    rm -rf "$DIR/../package-lock.json"

    #run upgrade scripts
    bash "$CUR/scripts/remove_moved_files.sh"
    bash "$CUR/../19.08/scripts/remove_chrome_cache.sh"

    #upgrade plugins
    (cd "$DIR/.." && sudo npm install --unsafe-perm)
    GLIBC_VERSION=$(ldd --version | head -n 1 | rev | cut -d ' ' -f 1 | rev)
    if [[ "$GLIBC_VERSION" != "2.25" ]]; then
        (cd "$DIR/.." && sudo npm install argon2 --build-from-source)
    fi
    userovo plugin upgrade push
    (cd "$DIR/../plugins/push/api/parts/apn" && npm install --unsafe-perm)
    userovo plugin upgrade attribution
    userovo plugin upgrade web
    userovo plugin enable active_users
    userovo plugin enable performance-monitoring
    
    #get web sdk
    userovo update sdk-web

    #install dependencies, process files and restart userovo
    userovo task dist-all

    #call after check
    userovo check after upgrade fs "$VER"
elif [ "$CONTINUE" == "0" ]
then
    echo "Filesystem is already upgraded to $VER"
elif [ "$CONTINUE" == "-1" ]
then
    echo "Filesystem is upgraded to higher version"
else
    echo "Unknown ugprade state: $CONTINUE"
fi
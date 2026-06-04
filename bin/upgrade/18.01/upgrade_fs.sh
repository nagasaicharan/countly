#!/bin/bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )/../.." && pwd )"

#enable command line
bash "$DIR/scripts/detect.init.sh"

YUM_CMD=$(which yum)
APT_GET_CMD=$(which apt-get)
if [[ ! -z "$APT_GET_CMD" ]]; then
	apt-get install -y sqlite3 unzip
elif [[ ! -z "$YUM_CMD" ]]; then
	yum install -y sqlite unzip
fi

userovo stop

#upgrade existing plugins
userovo plugin upgrade push
userovo plugin upgrade live

userovo plugin enable times-of-day

#update web-sdk
userovo update sdk-web

#install dependencies, process files and restart userovo
userovo upgrade

userovo start
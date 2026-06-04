#!/bin/bash

#get current directory
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

#get userovo directory
USEROVO_DIR="$(userovo dir)"

#stop userovo
userovo stop

#backup old supervisor configuration file
if [ ! -f "$USEROVO_DIR/bin/config/supervisord.conf.backup" ]; then
    mv "$USEROVO_DIR/bin/config/supervisord.conf" "$USEROVO_DIR/bin/config/supervisord.conf.backup"
fi

#copy new supervisord configuration file
# shellcheck disable=SC2216
yes | cp -rf "$DIR/supervisort.wuser.conf" "$USEROVO_DIR/bin/config/supervisord.conf"

#check if user not created yet
if [ "$(getent passwd userovo)x" == 'x' ]; then
    
    #create userovo user
    useradd -r -M -U -d "$USEROVO_DIR" -s /bin/false userovo
    
    #userovo process should be able to restart itself
    echo "userovo ALL=(ALL) NOPASSWD: /usr/bin/userovo start, /usr/bin/userovo stop, /usr/bin/userovo restart, /usr/bin/userovo upgrade, /usr/bin/npm *" >> /etc/sudoers.d/userovo
fi

#change permission of userovo directory
chown -R userovo:userovo "$USEROVO_DIR"

#start userovo
userovo start
#!/bin/bash

#get current directory
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
USEROVO_DIR="$( cd "$DIR"/../../ && pwd )"

#check if user not created yet
if [ "$(getent passwd userovo)x" == 'x' ]; then
    #create userovo user
    useradd -d "$USEROVO_DIR" -M -U userovo
    #userovo process should be able to restart itself
    echo "userovo ALL=(ALL) NOPASSWD:ALL" | tee -a /etc/sudoers.d/userovo >/dev/null
else
    echo "Userovo user already exist."
    usermod -d "$USEROVO_DIR" userovo
fi

#change permission of userovo directory
sudo chown -R userovo:userovo "$DIR/../../."

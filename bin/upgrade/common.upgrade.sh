#!/bin/bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )/.." && pwd )"
USEROVO_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )/../.." && pwd )"
USEROVO_DIR_NAME="$(basename "$USEROVO_DIR")"
USEROVO_OUT="$( cd "$( dirname "${BASH_SOURCE[0]}" )/../../.." && pwd )"
USEROVO_VERSION="$(userovo version)"

userovo_upgrade_pre (){
    #enable command line
    bash "$DIR/scripts/detect.init.sh"
}

userovo_upgrade_post (){
    #update web-sdk
    userovo update sdk-web
    
    #add indexes
    nodejs "$DIR/scripts/add_indexes.js"
    
    #install dependencies, process files and restart userovo
    userovo upgrade
}

userovo_staging (){
    #check if there is previous staging and 
    if [ -d "$USEROVO_OUT/staging_$USEROVO_DIR_NAME.$USEROVO_VERSION" ]; then
        echo "Staging already exist: $USEROVO_OUT/staging_$USEROVO_DIR_NAME.$USEROVO_VERSION"
        return 0
    fi
  
    #backup current userovo installation
    cp -rf "$USEROVO_OUT/$USEROVO_DIR_NAME" "$USEROVO_OUT/staging_$USEROVO_DIR_NAME.$USEROVO_VERSION"
    
    #clean logs
    mkdir -p "$USEROVO_DIR/log/logs.$USEROVO_VERSION"
    mv "$USEROVO_DIR/log/userovo-api.log" "$USEROVO_DIR/log/logs.$USEROVO_VERSION/userovo-api.log"
    mv "$USEROVO_DIR/log/userovo-dashboard.log" "$USEROVO_DIR/log/logs.$USEROVO_VERSION/userovo-dashboard.log"
}

userovo_staging_clean (){
    #clean failed upgrade if any
    if [ -d "$USEROVO_OUT/failed_$USEROVO_DIR_NAME.$USEROVO_VERSION" ]; then
        rm -rf "$USEROVO_OUT/failed_$USEROVO_DIR_NAME.$USEROVO_VERSION"
    fi
    
    #clean staging if any
    if [ -d "$USEROVO_OUT/staging_$USEROVO_DIR_NAME.$USEROVO_VERSION" ]; then
        rm -rf "$USEROVO_OUT/staging_$USEROVO_DIR_NAME.$USEROVO_VERSION"
    fi
}

userovo_staging_recover (){
    #check if there is previous staging 
    if [ -d "$USEROVO_OUT/staging_$USEROVO_DIR_NAME.$USEROVO_VERSION" ]; then
    
        if [ -d "$USEROVO_OUT/failed_$USEROVO_DIR_NAME.$USEROVO_VERSION" ]; then
            #remove current backup if it exists
            rm -rf "$USEROVO_OUT/failed_$USEROVO_DIR_NAME.$USEROVO_VERSION"
        fi
        
        #backup current upgrade attempt userovo installation
        mv -rf "$USEROVO_OUT/$USEROVO_DIR_NAME" "$USEROVO_OUT/failed_$USEROVO_DIR_NAME.$USEROVO_VERSION"
        
        #bring back staging to life
        mv -rf "$USEROVO_OUT/staging_$USEROVO_DIR_NAME.$USEROVO_VERSION" "$USEROVO_OUT/$USEROVO_DIR_NAME"
        
        #restart process
        userovo restart
    else
        echo "No staging available to recover"
    fi
}
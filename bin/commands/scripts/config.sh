#!/bin/bash
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

usage (){
    echo "";
    echo "userovo config usage:";
    echo "    userovo config <config.name>          # show config value";
    echo "    userovo config <config.name> <value>  # change config value";
    echo "    userovo config list                   # show available configurations";
    echo "    userovo config list values            # show available configurations and values";
} 
if [ -z "$1" ] && [ -z "$2" ]
then
    usage ;
else
    nodejs "$DIR/config.js" "$@" ;
fi
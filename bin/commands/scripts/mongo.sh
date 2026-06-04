#!/bin/bash
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

usage (){
    echo "";
    echo "userovo mongo:";
    echo "    userovo mongo <dbname> # outputs mongo cmd params to connect to specified userovo db";
}
if [ -z "$1" ]
then
    nodejs "$DIR/db.conf.js" ;
else
    nodejs "$DIR/db.conf.js" "$1" ;
fi
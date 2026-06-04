#!/bin/bash
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

usage (){
    echo "";
    echo "userovo api usage:";
    echo "    userovo api </request/path?plus=params> # makes api request and prints response";
    echo "    userovo api pretty </request/path?plus=params> # print pretty json response";
} 
if [ -z "$1" ]
then
    usage ;
else
    nodejs "$DIR/api.js" "$1" "$2" ;
fi
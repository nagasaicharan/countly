#!/bin/bash
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

usage (){
    echo "";
    echo "userovo fs usage:";
    echo "    userovo fs migrate <from> <to> # from fs to gridfs or vice versa";
} 
if [ -z "$1" ]
then
    usage ;
else
    nodejs "$DIR/fs.js" "$1" "$2" "$3";
fi
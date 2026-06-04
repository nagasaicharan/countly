#!/bin/bash
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

#set test configs
userovo config "api.batch_processing" "false"
userovo config "api.batch_read_processing" "false"
userovo config "drill.record_meta" "true"

userovo restart

until nc -z localhost 3001; do echo Waiting for Userovo; sleep 1; done

#install test dependencies
( cd "$DIR/../../../" ; sudo npm install --unsafe-perm )
#run tests
( cd "$DIR/../../../" ; npm test )
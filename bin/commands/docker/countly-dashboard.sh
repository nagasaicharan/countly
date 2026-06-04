#!/usr/bin/env bash

if [ "$USEROVO_MONGO_INSIDE" == "1" ]
then
	until mongosh localhost --eval "db.stats()" | grep "collections"
	do
	    echo
	    echo "[dashboard] waiting for MongoDB to allocate files ..."
	    sleep 1
	done
	sleep 3
	echo "[dashboard] MongoDB started"
fi

exec /sbin/setuser userovo /usr/bin/nodejs /opt/userovo/frontend/express/app.js

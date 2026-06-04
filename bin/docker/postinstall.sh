#!/bin/bash

if [ -f /opt/userovo/plugins/plugins.json ]; then
	echo "[docker] Plugins have been built, skipping rebuilding"
else
	if [ -z "$USEROVO_PLUGINS" ]; then
 		cp /opt/userovo/plugins/plugins.default.json /opt/userovo/plugins/plugins.json
		echo "[docker] Using default plugins.json"
  		cat /opt/userovo/plugins/plugins.json
	else
		echo "[docker] Using USEROVO_PLUGINS: $USEROVO_PLUGINS"
		if [[ $USEROVO_PLUGINS == *"drill"* ]] && [[ $USEROVO_PLUGINS != *"license"* ]]; then
    			USEROVO_PLUGINS=${USEROVO_PLUGINS/drill/license,drill}
			echo "[docker] added license plugin: $USEROVO_PLUGINS"
		fi

		a=$(echo "$USEROVO_PLUGINS" | tr ',' '\n')
		printf %s\\n "${a[@]}"|sed 's/["\]/\\&/g;s/.*/"&"/;1s/^/[/;$s/$/]/;$!s/$/,/' > /opt/userovo/plugins/plugins.json
  	fi

    #load city data into database
    node "/opt/userovo/bin/scripts/loadCitiesInDb.js"
fi

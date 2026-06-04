#!/bin/bash

# shellcheck disable=SC1091
source /etc/os-release
plugins="[";
while IFS= read -r -d '' plugin
do
    echo "Installing $plugin..."
	(cd "$plugin" && HOME=/tmp npm install --unsafe-perm=true --allow-root)
	plugins="$plugins\"$(basename "${plugin}")\","
	echo "done"
done <   <(find /opt/userovo/plugins -mindepth 1 -maxdepth 1 -type d -print0)

plugins="${plugins::-1}]"

node ./node_modules/geoip-lite/scripts/updatedb.js license_key="$GEOIP"

echo "$plugins" > /opt/userovo/plugins/plugins.json

(cd /opt/userovo && npx grunt dist-all && rm -rf /opt/userovo/plugins/plugins.json)

export CXX="" && export CC=""

#!/bin/bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )/.." && pwd )"

# use available init system
INITSYS="systemd"

if [ -z "$USEROVO_CONTAINER" ]; then
	if [[ $(/sbin/init --version) =~ upstart ]]; then
	    INITSYS="upstart"
	fi 2> /dev/null
else
	INITSYS="docker"
fi

bash "$DIR/commands/$INITSYS/install.sh"
ln -sf "$DIR/commands/$INITSYS/userovo.sh" "$DIR/commands/enabled/userovo.sh"

chmod +x "$DIR/commands/userovo.sh"
ln -sf "$DIR/commands/userovo.sh" /usr/bin/userovo

cp -f "$DIR/commands/scripts/autocomplete/userovo" /etc/bash_completion.d
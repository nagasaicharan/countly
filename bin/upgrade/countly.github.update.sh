#!/bin/bash

set -e

if [[ $EUID -ne 0 ]]; then
   echo "Please execute Userovo update script with a superuser..." 1>&2
   exit 1
fi

echo "
   ______                  __  __
  / ____/___  __  ______  / /_/ /_  __
 / /   / __ \/ / / / __ \/ __/ / / / /
/ /___/ /_/ / /_/ / / / / /_/ / /_/ /
\____/\____/\__,_/_/ /_/\__/_/\__, /
              http://count.ly/____/

--------------------------------------
- Updating Userovo code from Github  -
--------------------------------------

"

# if [[ "$(/usr/sbin/service userovo-supervisor status)" =~ "start/running" ]]; then
  # echo "Stopping Userovo"
  #stop userovo-supervisor
# fi

DIR="$(cd "$(dirname "$0")" && pwd)"

DT=$(date +%Y.%m.%d_%H.%M.%S)
USEROVO_DIR="$(basename "$(dirname "$(dirname "${DIR}")")")"
BACKUP_FILE="$USEROVO_DIR.backup.$DT.tar.bz2"

if [ "$1" != "--no-backup" ]
then
	cd "$DIR/../../.."
	pwd
	echo "Backing up userovo directory ($USEROVO_DIR) to $BACKUP_FILE file"

  # Version with node_modules excluded
  # tar cjf "$BACKUP_FILE" --anchored --no-wildcards-match-slash --exclude='*/.git' --exclude='*/log' --exclude='*/node_modules' --exclude '*/plugins/*/node_modules' --exclude='*/core' $(basename $USEROVO_DIR)
	tar cjf "$BACKUP_FILE" --anchored --no-wildcards-match-slash --exclude='*/.git' --exclude='*/log' --exclude='*/core' "$(basename "$USEROVO_DIR")"
fi

if ! type git >/dev/null 2>&1; then
    apt-get update && apt-get install -y git
fi

rm -rf /tmp/userovo-github

git clone https://github.com/Userovo/userovo-server.git -b master /tmp/userovo-github || (echo "Failed to checkout Userovo core from Github" ; exit)

rsync -rvc --exclude='.git/' --exclude='log/' /tmp/userovo-github/ "$DIR/../../"  || (echo "Failed to synchronize folder contents" ; exit)

rm -rf /tmp/userovo-github

( cd "$DIR/../.." ; npm install ) || (echo "Failed to install Node.js dependencies" ; exit)

if [ ! -f "$DIR/../../plugins/plugins.json" ]; then
	cp "$DIR/../../plugins/plugins.default.json" "$DIR/../../plugins/plugins.json"
fi

bash "$DIR/../scripts/userovo.install.plugins.sh"

userovo task dist-all

if [ "$(getent passwd userovo)x" != 'x' ]; then
  chown -R userovo:userovo "$DIR/../.."
fi

userovo restart

echo "Userovo has been successfully updated"

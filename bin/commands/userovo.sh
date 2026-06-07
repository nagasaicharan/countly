#!/bin/bash

# Resolve this wrapper through symlinks, because Docker links it as /usr/bin/userovo.
SOURCE="${BASH_SOURCE[0]}"
while [ -h "$SOURCE" ]; do
  DIR="$( cd -P "$( dirname "$SOURCE" )" && pwd )"
  SOURCE="$(readlink "$SOURCE")"
  [[ "$SOURCE" != /* ]] && SOURCE="$DIR/$SOURCE"
done
DIR="$( cd -P "$( dirname "$SOURCE" )" && pwd )"

if [ -f "$DIR/countly.sh" ]; then
  exec "$DIR/countly.sh" "$@"
fi

exec "$DIR/../countly.sh" "$@"

#!/bin/bash

/opt/userovo/bin/docker/postinstall.sh

if [ -z "$USEROVO_CONFIG_HOSTNAME" ]; then
  echo "[docker] ERROR: Please set USEROVO_CONFIG_HOSTNAME with your planned Userovo hostname, i.e. userovo.example.com"
fi

case "$USEROVO_CONTAINER" in
  "api" )
    exec node /opt/userovo/api/api.js
    ;;

  "frontend" )
  	exec node /opt/userovo/frontend/express/app.js
    ;;

   * )
    # Run custom command. Thanks to this line we can still use 
    # "docker run our_image /bin/bash" and it will work
    exec "$CMD" "${@:2}"
    ;;
esac
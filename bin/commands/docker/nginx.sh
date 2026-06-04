#!/usr/bin/env bash

/usr/bin/nodejs /opt/userovo/bin/scripts/create_nginx_conf.js
exec /usr/sbin/nginx

#!/bin/bash

echo "Userovo info :";
echo "    version : $(userovo version)";
echo "    path    : $(userovo dir)";
status=$(userovo status)
if (( $(grep -c . <<<"$status") > 1 )); then
    status=$(echo "${status}" | grep "Active: " | sed -e 's/^[[:space:]]*//')
    status=${status#"Active: "}
    if ! [ -z "${status}" ]; then
        echo "    status  : $status"
    else
        echo "    status  : $(userovo status)";
    fi
else
    echo "    status  : $status";
fi

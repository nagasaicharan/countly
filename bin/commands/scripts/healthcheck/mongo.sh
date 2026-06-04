#!/bin/bash
IFS=" " read -r -a con <<< "$(userovo mongo)"
res=$(mongosh userovo "${con[@]}" --eval "print('CLYTest')")
if ! [[ "$res" == *"CLYTest"* ]]; then
    echo -e "Can't connect to MongoDB";
fi
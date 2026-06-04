#!/bin/bash

if [ -z "$GITHUB_HEAD_REF" ] && [ "$GITHUB_REPOSITORY" == "Userovo/userovo-server" ]; then
    GITHUB_BRANCH=${GITHUB_REF#refs/heads/}
    echo "$GITHUB_BRANCH"
    if [ "$GITHUB_BRANCH" == "master" ]; then
        echo "$SSH_PRIVATE_KEY" > deploy-key;
        mkdir -p ~/.ssh;
        mv deploy-key ~/.ssh/id_rsa;
        chmod 600 ~/.ssh/id_rsa;
        ssh -oStrictHostKeyChecking=no "userovo@release-2503.count.ly" "bash /home/userovo/deploy.sh > /home/userovo/logs/userovo-deploy-github.log 2>&1 &"
        ssh -oStrictHostKeyChecking=no "userovo@ce.count.ly" "bash /home/userovo/deploy.sh > /home/userovo/logs/userovo-deploy-github.log 2>&1 &"
    fi
fi

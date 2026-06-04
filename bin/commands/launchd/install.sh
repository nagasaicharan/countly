#!/bin/bash

sudo cp /usr/local/Cellar/mongodb/2.2.0-x86_64/homebrew.mxcl.mongodb.plist /Library/LaunchDaemons/
sudo cp com.userovo.dashboard.plist /Library/LaunchDaemons/
sudo cp com.userovo.api.plist /Library/LaunchDaemons/

sudo launchctl load homebrew.mxcl.mongodb.plist
sudo launchctl load com.userovo.dashboard.plist
sudo launchctl load com.userovo.api.plist
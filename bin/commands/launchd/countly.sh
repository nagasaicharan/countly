#!/bin/bash

userovo_start () { 
    launchctl start com.userovo.api;
    launchctl start com.userovo.dashboard;
}

userovo_stop () { 
    launchctl stop com.userovo.api;
    launchctl stop com.userovo.dashboard;
}

userovo_restart () {
    userovo start;
    userovo stop;
}

userovo_status () { 
    launchctl list | grep com.userovo.api;
    launchctl list | grep com.userovo.dashboard;
}
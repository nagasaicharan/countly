#!/bin/bash

userovo_start (){ 
    sudo /usr/bin/sv start userovo-api userovo-dashboard;
}

userovo_stop (){ 
    sudo /usr/bin/sv stop userovo-api userovo-dashboard;
}

userovo_restart (){
    sudo /usr/bin/sv restart userovo-api userovo-dashboard;
}

userovo_status (){
    sudo /usr/bin/sv status userovo-api;
    sudo /usr/bin/sv status userovo-dashboard;
}

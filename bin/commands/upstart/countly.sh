#!/bin/bash

userovo_start (){ 
    userovo_root ;
    start userovo-supervisor;
} 

userovo_stop (){ 
    userovo_root ;
    stop userovo-supervisor;
} 

userovo_restart (){ 
    userovo_root ;
    restart userovo-supervisor;
} 

userovo_status (){ 
    status userovo-supervisor;
} 
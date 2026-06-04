#!/bin/bash

boot_configurations () {
    LIMIT_NO_FILE=$(($(($(lscpu |grep 'CPU(s):'|head -1|awk -F' ' '{print $2}')*1000)) + 10000))
    sed -i '/LimitNOFILE/d' /etc/systemd/system/userovo.service
    sed -i "s#\[Service\]#\[Service\]\nLimitNOFILE=${LIMIT_NO_FILE}#g" /etc/systemd/system/userovo.service
    systemctl daemon-reload

    SERVICE_USER=$(grep 'user' "$(userovo dir)/bin/config/supervisord.conf"|awk -F'=' '{print $2}')
    chown -R "$SERVICE_USER:$SERVICE_USER" "$(userovo dir)"
}

userovo_start () {
    userovo_root ;
    boot_configurations ;
    systemctl start userovo;
}

userovo_stop () {
    userovo_root ;
    systemctl stop userovo;
}

userovo_restart () {
    userovo_root ;
    boot_configurations ;
    systemctl restart userovo;
}

userovo_status () {
    systemctl status userovo;
}

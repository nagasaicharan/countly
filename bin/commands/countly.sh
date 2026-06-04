#!/bin/bash

#get current dir through symlink
SOURCE="${BASH_SOURCE[0]}"
while [ -h "$SOURCE" ]; do # resolve $SOURCE until the file is no longer a symlink
  DIR="$( cd -P "$( dirname "$SOURCE" )" && pwd )"
  SOURCE="$(readlink "$SOURCE")"
  [[ "$SOURCE" != /* ]] && SOURCE="$DIR/$SOURCE" # if $SOURCE was a relative symlink, we need to resolve it relative to the path where the symlink file was located
done
DIR="$( cd -P "$( dirname "$SOURCE" )" && pwd )"

#get current userovo version
VERSION="$(grep -oP 'version:\s*"\K[0-9\.]*' "$DIR/../../frontend/express/version.info.js")"

export LANGUAGE=C ; export LC_ALL=C ;

#stub commands to be overwritten
userovo_start (){
    echo "start stub";
}

userovo_stop (){
    echo "stop stub";
}

userovo_restart (){
    echo "restart stub";
}

userovo_status (){
    echo "status stub";
}

userovo_root (){
    if [[ $EUID -ne 0 ]]; then
        echo "This command must be run as root"
        exit 1
    fi
}

#real commands, can also be overwritten

run_upgrade (){
    if [[ $2 == "fs" ]]
    then
        echo "Upgrading filesystem versions: $1";
    elif [[ $2 == "db" ]]
    then
        echo "Upgrading database versions: $1";
    else
        echo "Upgrading versions: $1";
    fi
    arr=("$@");
    for i in ${1//;/ }
    do
        DATE=$(date +%Y-%m-%d:%H:%M:%S)
        if [[ $2 == "fs" ]]
        then
            if [ -f "$DIR/../upgrade/$i/upgrade_fs.sh" ]; then
                if [[ " ${arr[*]} " != *" -y "* ]]; then
                    echo "Upgrading filesystem for $i. y/n?";
                    read -r choice;
                    if [ "$choice" != "y" ]; then
                        continue
                    fi
                fi
                bash "$DIR/../upgrade/$i/upgrade_fs.sh" | tee -a "$DIR/../../log/userovo-upgrade-fs-$i-$DATE.log";
            else
                echo "No filesystem upgrade script provided for $i";
            fi
        elif [[ $2 == "db" ]]
        then
            if [ -f "$DIR/../upgrade/$i/upgrade_db.sh" ]; then
                if [[ " ${arr[*]} " != *" -y "* ]]; then
                    echo "Upgrading database for $i. y/n?";
                    read -r choice;
                    if [ "$choice" != "y" ]; then
                        continue
                    fi
                fi
                bash "$DIR/../upgrade/$i/upgrade_db.sh" | tee -a "$DIR/../../log/userovo-upgrade-db-$i-$DATE.log";
            else
                echo "No database upgrade script provided for $i";
            fi
        else
            if [ -f "$DIR/../upgrade/$i/upgrade.sh" ]; then
                if [[ " ${arr[*]} " != *" -y "* ]]; then
                    echo "Upgrading for $i. y/n?";
                    read -r choice;
                    if [ "$choice" != "y" ]; then
                        continue
                    fi
                fi
                bash "$DIR/../upgrade/$i/upgrade.sh" combined 2>&1 | tee -a "$DIR/../../log/userovo-upgrade-$i-$DATE.log";
            else
                echo "No upgrade script provided for $i";
            fi
        fi
    done
}
userovo_upgrade (){
    arr=("$@");
    if [[ " ${arr[*]} " == *" -y "* ]]; then
        y="-y";
        for arg do
            shift
            [ "$arg" = "-y" ] && continue
            set -- "$@" "$arg"
        done
    fi
    userovo_root ;
    if [ $# -eq 0 ]
    then
        INOFFLINEMODE=$(userovo config 'api.offline_mode' | awk '/=/{print $NF}')

        if [ "$INOFFLINEMODE" == "false" ]
        then
            (cd "$DIR"/../..;
            echo "Installing dependencies...";
            sudo npm install;)
        fi

        (cd "$DIR/../.." ;
        echo "Installing plugins...";
        node "$DIR/../scripts/install_plugins.js" --skip-production;
        echo "Preparing production files...";
        userovo task dist-all;
        echo "Restarting Userovo...";
        sudo userovo restart;
        )
    elif [ "$1" == "auto" ]
    then
        if UPGRADE=$(nodejs "$DIR/../scripts/checking_versions.js");
        then
            run_upgrade "$UPGRADE" "$2" "$y";
        else
            echo "$UPGRADE";
        fi
    elif [ "$1" == "version" ]
    then
        if [ $# -eq 3 ] || [ $# -eq 4 ]
        then
            if [ "$2" == "fs" ] || [ "$2" == "db" ]
            then
                if UPGRADE=$(nodejs "$DIR/../scripts/checking_versions.js" "$3" "$4")
                then
                    run_upgrade "$UPGRADE" "$2" "$y";
                else
                    echo "$UPGRADE";
                fi
            elif [ $# -ge 3 ]
            then
                if UPGRADE=$(nodejs "$DIR/../scripts/checking_versions.js" "$2" "$3")
                then
                    run_upgrade "$UPGRADE" "$2" "$y";
                else
                    echo "$UPGRADE";
                fi
            fi
        else
            echo "Provide upgrade version in format:";
            echo "    userovo upgrade version <from> <to>";
            echo "    userovo upgrade version fs <from> <to>";
            echo "    userovo upgrade version db <from> <to>";
        fi
    elif [ "$1" == "list" ]
    then
        if [ $# -eq 2 ] && [ "$2" == "auto" ]
        then
            nodejs "$DIR/../scripts/checking_versions.js";
            echo "";
        elif [ $# -eq 3 ]
        then
            nodejs "$DIR/../scripts/checking_versions.js" "$2" "$3";
            echo "";
        else
            echo "Provide upgrade version in formats:";
            echo "    userovo upgrade list auto";
            echo "    userovo upgrade list <from> <to>";
        fi
    elif [ "$1" == "run" ]
    then
        if [ "$2" == "fs" ] || [ "$2" == "db" ]
        then
            run_upgrade "$3" "$2" "$y";
        elif [ $# -ge 2 ]
        then
            run_upgrade "$2" upgrade "$y";
        else
            echo "Provide upgrade version in formats:";
            echo "    userovo upgrade run <version>";
            echo "    userovo upgrade run fs <version>";
            echo "    userovo upgrade run db <version>";
        fi
    elif [ "$1" == "ee" ]
    then
        FILE=$(ls -tr "$DIR/../../../"userovo-enterprise-edition*.tar.gz 2> /dev/null | tail -1 | awk -F' ' '{print $NF}')

        if [ -f "$FILE" ]; then
            tar -zxf "${FILE}" -C /tmp "userovo/frontend/express/version.info.js"
            NEW_VERSION="$(grep -oP 'version:\s*"\K[0-9\.]*' "/tmp/userovo/frontend/express/version.info.js")"
            rm -rf /tmp/userovo

            if [ "$VERSION" == "$NEW_VERSION" ]; then
                cp -Rf "$DIR/../../"plugins/plugins.default.json "$DIR/../../"plugins/plugins.ce.json

                echo "Extracting Userovo Enterprise..."
                (cd "$DIR/../../../";
                tar -zxf "${FILE}";)

                EE_PLUGINS=$(sed 's/\"//g' "$DIR/../../plugins/plugins.ee.json" | sed 's/\[//g' | sed 's/\]//g')
                CE_PLUGINS=$(sed 's/\"//g' "$DIR/../../plugins/plugins.ce.json" | sed 's/\[//g' | sed 's/\]//g')
                PLUGINS_DIFF=$(echo " ${EE_PLUGINS}, ${CE_PLUGINS}" | tr ',' '\n' | sort | uniq -u)
                echo "Enabling plugins..."
                for plugin in $PLUGINS_DIFF; do
                    userovo plugin enable "$plugin"
                done

                echo "Upgrading Userovo..."
                userovo upgrade
            else
                echo "Version mismatch detected! Version of Userovo Lite should be the same with Userovo Enterprise. Please upgrade Userovo to Userovo Lite v${NEW_VERSION} first."
                echo "Userovo Lite v${VERSION}"
                echo "Userovo Enterprise v${NEW_VERSION}"
            fi
        else
            echo "Error: Couldn't find any Userovo Enterprise package, you should place archive file into '$(cd "$DIR/../../../"; pwd;)'"
        fi
    elif [ "$1" == "ce" ]
    then
        FILE=$(ls -tr "$DIR/../../../"userovo-community-edition*.tar.gz 2> /dev/null | tail -1 | awk -F' ' '{print $NF}')

        if [ -f "$FILE" ]; then
            tar -zxf "${FILE}" -C /tmp "userovo/frontend/express/version.info.js"
            NEW_VERSION="$(grep -oP 'version:\s*"\K[0-9\.]*' "/tmp/userovo/frontend/express/version.info.js")"
            rm -rf /tmp/userovo

            echo -e "\e[91m\n\n                        !!!   WARNING   !!!          \n\nYou are going to downgrade from Userovo Enterprise to Userovo Lite;\nthis will disable all Userovo Enterprise plugins, delete all Enterprise\nEdition plugins and also will drop 'userovo_drill' database since it contains\ndata for Userovo Enterprise features.\e[0m"
            read -r -p "Are you sure you want to continue? [y/N] " response
            if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]
            then
                CONTINUE=1
            fi

            if [ "$CONTINUE" == "1" ]; then
                if [ "$VERSION" == "$NEW_VERSION" ]; then
                    cp -Rf "$DIR/../../"plugins/plugins.json "$DIR/../../"plugins/plugins.ee.json

                    echo "Extracting Userovo Lite..."
                    (cd "$DIR/../../../";
                    tar -zxf "${FILE}";)
                    bash "$DIR/../scripts/detect.init.sh"

                    CE_PLUGINS=$(sed 's/\"//g' "$DIR/../../plugins/plugins.default.json" | sed 's/\[//g' | sed 's/\]//g')
                    EE_PLUGINS=$(sed 's/\"//g' "$DIR/../../plugins/plugins.ee.json" | sed 's/\[//g' | sed 's/\]//g')
                    PLUGINS_DIFF=$(echo " ${CE_PLUGINS}, ${EE_PLUGINS}" | tr ',' '\n' | sort | uniq -u)
                    echo "Disabling plugins..."
                    for plugin in $PLUGINS_DIFF; do
                        userovo plugin disable "$plugin"
                        rm -rf "$DIR/../../plugins/$plugin"
                    done

                    ## shellcheck requires variables and commands in double quote and this also add single quotes
                    ## to command, so that's why I prepared whole command as variable and provide it to bash
                    MONGO_URI="$(userovo mongo)"
                    DROP_COMMAND="mongosh ${MONGO_URI} --eval 'db.getSiblingDB(\"userovo_drill\").dropDatabase();'"
                    echo "Dropping 'userovo_drill' database..."
                    bash -c "${DROP_COMMAND}"

                    echo "Upgrading Userovo..."
                    userovo upgrade
                else
                    echo "Version mismatch detected! Version of Userovo Enterprise should be the same with Userovo Lite. Please upgrade Userovo to Userovo Enterprise v${NEW_VERSION} first."
                    echo "Userovo Enterprise v${VERSION}"
                    echo "Userovo Lite v${NEW_VERSION}"
                    echo -e "\nYou can run the command below & 'userovo upgrade ce' again if you think core of Userovo v${VERSION} is compatible to work with v${NEW_VERSION}.\nsed -i 's/version: \"${VERSION}\"/version: \"${NEW_VERSION}\"/g' $(userovo dir)/frontend/express/version.info.js\n"
                fi
            fi
        else
            echo "Error: Couldn't find any Userovo Lite package, you should place archive file into '$(cd "$DIR/../../../"; pwd;)'"
        fi
    elif [ "$1" == "help" ]
    then
        echo "userovo upgrade usage:"
        echo "    userovo upgrade                                  # prepare production files and restart process";
        echo "    userovo upgrade auto [-y]                        # automatically run all upgrade scripts between marked and current versions";
        echo "    userovo upgrade auto fs [-y]                     # automatically run all file system upgrade scripts between marked and current versions";
        echo "    userovo upgrade auto db [-y]                     # automatically run all database upgrade scripts between marked and current versions";
        echo "    userovo upgrade list auto                        # list all version upgrades that will be used in auto upgrade";
        echo "    userovo upgrade list <from_version> <to_version> # list all version upgrades that will be used upgrading from and to provided version";
        echo "    userovo upgrade run <version> [-y]               # run specific version upgrade script";
        echo "    userovo upgrade run fs <version> [-y]            # run specific version file upgrade script";
        echo "    userovo upgrade run db <version> [-y]            # run specific version database script";
        echo "    userovo upgrade version <from> <to> [-y]         # run all upgrade scripts between provided versions";
        echo "    userovo upgrade version fs <from> <to> [-y]      # run all filesystem upgrade scripts between provided versions";
        echo "    userovo upgrade version db <from> <to> [-y]      # run all database upgrade scripts between provided versions";
        echo "    userovo upgrade ee                               # upgrade from Userovo Lite to Userovo Enterprise within the same version";
        echo "    userovo upgrade ce                               # upgrade from Userovo Enterprise to Userovo Lite within the same version";
        echo "    userovo upgrade help                             # this command";
    fi
}

userovo_mark_version (){
    if [ "$1" == "fs" ] || [ "$1" == "db" ]
    then
        UPGRADE=$(nodejs "$DIR/../scripts/version_marks.js" write_"$1" "$2");
    elif [ "$1" == "help" ]
    then
        echo "userovo mark_version usage:"
        echo "    userovo mark_version fs <version> # upgrades fs version";
        echo "    userovo mark_version db <version> # upgrades db version";
        echo "    userovo mark_version help         # this command";
    fi
}

userovo_compare_version (){
    if [ "$1" == "fs" ] || [ "$1" == "db" ]
    then
        UPGRADE=$(nodejs "$DIR/../scripts/version_marks.js" compare_"$1" "$2");
        echo "$UPGRADE";
    elif [ "$1" == "help" ]
    then
        echo "userovo compare_version usage:"
        echo "    userovo compare_version fs <version> # compares fs version";
        echo "    userovo compare_version db <version> # compares db version";
        echo "    userovo compare_version help         # this command";
    fi
}

userovo_check(){

    if [ "$2" == "upgrade" ]
    then
        if [ "$1" == "before" ]
        then
            VERSION_DIFF=$(userovo compare_version "$3" "$4");
            if [ "$VERSION_DIFF" == "-1" ]
            then
                echo "1" #"continue updating"
            else
                echo "0" #"up to date"
            fi
        elif [ "$1" == "after" ]
        then
            userovo mark_version "$3" "$4";
        fi
    elif [ "$2" == "install" ]
    then
        if [ "$1" == "after" ]
        then
            userovo mark_version fs "$VERSION";
            userovo mark_version db "$VERSION";
        fi
    fi
}

userovo_version (){
    echo "$VERSION";
}

userovo_dir (){
    ( cd "$DIR/../.." && pwd );
}

userovo_test (){
    userovo_root ;
    bash "$DIR/scripts/userovo.run.tests.sh" ;
}

userovo_backupfiles (){
    if [ $# -eq 0 ]
    then
        echo "Please provide path" ;
        return 0;
    fi
    (mkdir -p "$1" ;
    cd "$1" ;
    echo "Backing up Userovo configurations and files...";
    mkdir -p files/nginx;
    mkdir -p files/extend ;
    mkdir -p files/frontend/express/public/appimages ;
    mkdir -p files/frontend/express/public/userimages ;
    mkdir -p files/frontend/express/public/themes ;
    mkdir -p files/frontend/express/certificates ;
    mkdir -p files/frontend/express/public/javascripts/userovo ;
    mkdir -p files/api ;
    if [ -f "$DIR/../../frontend/express/config.js" ]; then
        cp "$DIR/../../frontend/express/config.js" files/frontend/express/config.js
    fi
    if [ -f "$DIR/../../frontend/express/public/javascripts/userovo/userovo.config.js" ]; then
        cp "$DIR/../../frontend/express/public/javascripts/userovo/userovo.config.js" files/frontend/express/public/javascripts/userovo/userovo.config.js
    fi
    if [ -f "$DIR/../../api/config.js" ]; then
        cp "$DIR/../../api/config.js" files/api/config.js
    fi
    if [ -d "$DIR/../../extend" ]; then
        cp -a "$DIR/../../extend/." files/extend/
    fi
    if [ -d "$DIR/../../frontend/express/public/appimages" ]; then
        cp -a "$DIR/../../frontend/express/public/appimages/." files/frontend/express/public/appimages/
    fi
    if [ -d "$DIR/../../frontend/express/public/userimages" ]; then
        cp -a "$DIR/../../frontend/express/public/userimages/." files/frontend/express/public/userimages/
    fi
    if [ -d "$DIR/../../frontend/express/public/themes" ]; then
        cp -a "$DIR/../../frontend/express/public/themes/." files/frontend/express/public/themes/
    fi
    if [ -d "$DIR/../../frontend/express/certificates" ]; then
        cp -a "$DIR/../../frontend/express/certificates/." files/frontend/express/certificates/
    fi

    for d in "$DIR"/../../plugins/*; do
        PLUGIN="$(basename "$d")";
        if [ -f "$d/config.js" ]; then
            mkdir -p "files/plugins/$PLUGIN" ;
            cp "$d/config.js" "files/plugins/$PLUGIN/config.js" ;
        fi
        if [ -d "$d/extend" ]; then
            mkdir -p "files/plugins/$PLUGIN/extend" ;
            cp -a "$d/extend/." "files/plugins/$PLUGIN/extend/" ;
        fi
        if [ -d "$d/crashsymbols" ]; then
            mkdir -p "files/plugins/$PLUGIN/crashsymbols" ;
            cp -a "$d/crashsymbols/." "files/plugins/$PLUGIN/crashsymbols/" ;
        fi
    done
    if [ -f /etc/nginx/sites-available/default ]; then
        cp /etc/nginx/sites-available/default files/nginx
    elif [ -f /etc/nginx/conf.d/default.conf ]; then
        cp /etc/nginx/conf.d/default.conf files/nginx
    fi
    cp /etc/nginx/nginx.conf files/nginx
    )
}

userovo_backupdb (){
    if [ $# -eq 0 ]
    then
        echo "Please provide path" ;
        return 0;
    fi
    (mkdir -p "$1" ;
    cd "$1" ;
    echo "Backing up mongodb...";
    shift
    #allow passing custom flags
    IFS=" " read -r -a con <<< "$(node "$DIR/scripts/db.conf.js")"
    connection=( "${con[@]}"  "${@}" );
    STATUS=0

    mongodump "${connection[@]}" --db userovo 2>&1 | tee "$DIR/../../log/userovo-backup-$DATE.log";
    if [ "${PIPESTATUS[0]}" -ne 0 ]
    then
        STATUS=1
    fi

    mongodump "${connection[@]}" --db userovo_drill 2>&1 | tee -a "$DIR/../../log/userovo-backup-$DATE.log";
    if [ "${PIPESTATUS[0]}" -ne 0 ]
    then
        STATUS=1
    fi

    mongodump "${connection[@]}" --db userovo_fs 2>&1 | tee -a "$DIR/../../log/userovo-backup-$DATE.log";
    if [ "${PIPESTATUS[0]}" -ne 0 ]
    then
        STATUS=1
    fi

    mongodump "${connection[@]}" --db userovo_out 2>&1 | tee -a "$DIR/../../log/userovo-backup-$DATE.log";
    if [ "${PIPESTATUS[0]}" -ne 0 ]
    then
        STATUS=1
    fi

    exit $STATUS;
    )
}

userovo_backup (){
    if [ $# -eq 0 ]
    then
        echo "Please provide path" ;
        return 0;
    fi
    userovo_backupfiles "$@";
    userovo_backupdb "$@";
}

userovo_save (){
    if [ $# -eq 1 ]
    then
        echo "Please provide destination path";
        return 0;
    fi

    if [ $# -lt 2 ]
    then
        echo "Please provide file paths" ;
        return 0;
    fi

    if [ ! -d "$2" ]
    then
        mkdir -p "$2"
    fi

    if [ -f "$1" ]
    then
        match=false
        files=$(find "$2" -maxdepth 1 -type f -printf x | wc -c)

        if [ "$files" -gt 0 ]
        then
            for d in "$2"/*; do
                diff=$(diff "$1" "$d" | wc -l)
                if [ "$diff" == 0 ]
                then
                    match=true
                    break
                fi
            done
        fi

        files=$((files+1))
        filebasename=$(basename "$1")
        if [ "$match" == false ]
        then
            cp -a "$1" "$2/${filebasename}.backup.${files}"
        fi

    else
        echo "The file does not exist"
    fi
}

userovo_restorefiles (){
    if [ $# -eq 0 ]
    then
        echo "Please provide path" ;
        return 0;
    fi
    if [ -d "$1/files" ]; then
        echo "Restoring Userovo configurations and files...";
        (cd "$1" ;
        mkdir -p "$DIR/../../extend" ;
        mkdir -p "$DIR/../../frontend/express/public/appimages" ;
        mkdir -p "$DIR/../../frontend/express/public/userimages" ;
        mkdir -p "$DIR/../../frontend/express/public/themes" ;
        mkdir -p "$DIR/../../frontend/express/certificates" ;
        mkdir -p "$DIR/../../frontend/express/public/javascripts/userovo" ;
        mkdir -p "$DIR/../../api" ;
        if [ -f files/frontend/express/config.js ]; then
            cp files/frontend/express/config.js "$DIR/../../frontend/express/config.js"
        fi
        if [ -f files/frontend/express/public/javascripts/userovo/userovo.config.js ]; then
            cp files/frontend/express/public/javascripts/userovo/userovo.config.js "$DIR/../../frontend/express/public/javascripts/userovo/userovo.config.js"
        fi
        if [ -f files/api/config.js ]; then
            cp files/api/config.js "$DIR/../../api/config.js"
        fi
        if [ -d files/extend ]; then
            cp -a files/extend/. "$DIR/../../extend/"
        fi
        if [ -d files/frontend/express/public/appimages ]; then
            cp -a files/frontend/express/public/appimages/. "$DIR/../../frontend/express/public/appimages/"
        fi
        if [ -d files/frontend/express/public/userimages ]; then
            cp -a files/frontend/express/public/userimages/. "$DIR/../../frontend/express/public/userimages/"
        fi
        if [ -d files/frontend/express/public/themes ]; then
            cp -a files/frontend/express/public/themes/. "$DIR/../../frontend/express/public/themes/"
        fi
        if [ -d files/frontend/express/certificates ]; then
            cp -a files/frontend/express/certificates/. "$DIR/../../frontend/express/certificates/"
        fi

        for d in files/plugins/*; do
            PLUGIN=$(basename "$d");
            if [ -f "$d/config.js" ]; then
                mkdir -p "$DIR/../../plugins/$PLUGIN" ;
                cp "$d/config.js" "$DIR/../../plugins/$PLUGIN/config.js" ;
            fi
            if [ -d "$d/extend" ]; then
                mkdir -p "$DIR/../../plugins/$PLUGIN/extend" ;
                cp -a "$d/extend/." "$DIR/../../plugins/$PLUGIN/extend/" ;
            fi
            if [ -d "$d/crashsymbols" ]; then
                mkdir -p "$DIR/../../plugins/$PLUGIN/crashsymbols" ;
                cp -a "$d/crashsymbols/." "$DIR/../../plugins/$PLUGIN/crashsymbols/" ;
            fi
        done

        if [ -f /etc/nginx/sites-available/default ]; then
            cp files/nginx/default /etc/nginx/sites-available/default
        elif [ -f /etc/nginx/conf.d/default.conf ]; then
            cp files/nginx/default.conf /etc/nginx/conf.d/default.conf
        fi
        cp files/nginx/nginx.conf /etc/nginx/nginx.conf
        )
    else
        echo "No files to restore from";
    fi
}

userovo_restoredb (){
    if [ $# -eq 0 ]
    then
        echo "Please provide path" ;
        return 0;
    fi
    CLY_EXPORT_PATH=$1
    shift
    #allow passing custom flags
    IFS=" " read -r -a con <<< "$(node "$DIR/scripts/db.conf.js")"
    connection=( "${con[@]}"  "${@}" );
    STATUS=0

    if [ -d "$CLY_EXPORT_PATH/dump/userovo" ]; then
        echo "Restoring userovo database...";
        mongorestore "${connection[@]}" --db userovo --batchSize=10 "$CLY_EXPORT_PATH/dump/userovo" 2>&1 | tee "$DIR/../../log/userovo-restore-$DATE.log";
        if [ "${PIPESTATUS[0]}" -ne 0 ]
        then
            STATUS=1
        fi
    else
        echo "No userovo database dump to restore from";
    fi

    if [ -d "$CLY_EXPORT_PATH/dump/userovo_drill" ]; then
        echo "Restoring userovo_drill database...";
        mongorestore "${connection[@]}" --db userovo_drill --batchSize=10 "$CLY_EXPORT_PATH/dump/userovo_drill" 2>&1 | tee -a "$DIR/../../log/userovo-restore-$DATE.log";
        if [ "${PIPESTATUS[0]}" -ne 0 ]
        then
            STATUS=1
        fi
    else
        echo "No userovo_drill database dump to restore from";
    fi

    if [ -d "$CLY_EXPORT_PATH/dump/userovo_fs" ]; then
        echo "Restoring userovo_fs database...";
        mongorestore "${connection[@]}" --db userovo_fs --batchSize=10 "$CLY_EXPORT_PATH/dump/userovo_fs" 2>&1 | tee -a "$DIR/../../log/userovo-restore-$DATE.log";
        if [ "${PIPESTATUS[0]}" -ne 0 ]
        then
            STATUS=1
        fi
    else
        echo "No userovo_fs database dump to restore from";
    fi

    if [ -d "$CLY_EXPORT_PATH/dump/userovo_out" ]; then
        echo "Restoring userovo_out database...";
        mongorestore "${connection[@]}" --db userovo_out --batchSize=10 "$CLY_EXPORT_PATH/dump/userovo_out" 2>&1 | tee -a "$DIR/../../log/userovo-restore-$DATE.log";
        if [ "${PIPESTATUS[0]}" -ne 0 ]
        then
            STATUS=1
        fi
    else
        echo "No userovo_out database dump to restore from";
    fi

    exit $STATUS;
}

userovo_restore (){
    if [ $# -eq 0 ]
    then
        echo "Please provide path" ;
        return 0;
    fi
    userovo_restorefiles "$@";
    userovo_restoredb "$@";
}

#load real platform/init sys file to overwrite stubs
# shellcheck source=/dev/null
source "$DIR/enabled/userovo.sh"

#process command
NAME="$1";
SCRIPT="$2";
if [ -n "$(type -t "userovo_$1")" ] && [ "$(type -t "userovo_$1")" = function ]; then
    shift;
    "userovo_${NAME}" "$@";
elif [ -f "$DIR/scripts/$NAME.sh" ]; then
    shift;
    bash "$DIR/scripts/$NAME.sh" "$@";
elif [ -f "$DIR/scripts/$NAME.js" ]; then
    shift;
    nodejs "$DIR/scripts/$NAME.js" "$@";
elif [ -d "$DIR/../../plugins/$NAME" ] && [ -f "$DIR/../../plugins/$NAME/scripts/$SCRIPT.sh" ]; then
    shift;
    shift;
    bash "$DIR/../../plugins/$NAME/scripts/$SCRIPT.sh" "$@";
elif [ -d "$DIR/../../plugins/$NAME" ] && [ -f "$DIR/../../plugins/$NAME/scripts/$SCRIPT.js" ]; then
    shift;
    shift;
    nodejs "$DIR/../../plugins/$NAME/scripts/$SCRIPT.js" "$@";
elif [ -d "$DIR/../../plugins/$NAME" ] && [ -f "$DIR/../../plugins/$NAME/scripts/$NAME.sh" ]; then
    shift;
    bash "$DIR/../../plugins/$NAME/scripts/$NAME.sh" "$@";
elif [ -d "$DIR/../../plugins/$NAME" ] && [ -f "$DIR/../../plugins/$NAME/scripts/$NAME.js" ]; then
    shift;
    nodejs "$DIR/../../plugins/$NAME/scripts/$NAME.js" "$@";
else
    echo "";
    echo "userovo usage:";
    echo "    userovo start   # starts userovo process";
    echo "    userovo stop    # stops userovo process";
    echo "    userovo restart # restarts userovo process";
    echo "    userovo upgrade # standard upgrade process (install dependencies, minify files, restart userovo)";
    echo "    userovo version # outputs current userovo version";
    echo "    userovo dir     # outputs userovo install directory";
    echo "    userovo test    # run userovo tests";
    echo "    userovo usage   # prints this out, but so as basically everything else does";
    echo "    userovo mark_version # updates current version info (for db and fs, separately)"
    echo "    userovo compare_version # compares given version to installed version, returns 1 if installed is new (for db and fs, separately)"
    echo "    userovo backupfiles path/to/backup # backups userovo user/config files";
    echo "    userovo backupdb path/to/backup # backups userovo database";
    echo "    userovo backup path/to/backup # backups userovo db and user/config files";
    echo "    userovo restorefiles path/to/backup # restores user/config files from provided backup";
    echo "    userovo restoredb path/to/backup # restores userovo db from provided backup";
    echo "    userovo restore path/to/backup # restores userovo db and config files from provided backup";
    echo "    userovo save path/to/file /path/to/destination # copies the given file to the destination if no file with same data is present at the destination";
    userovo api ;
    userovo plugin ;
    userovo update ;
    userovo config ;
    userovo upgrade help ;
    userovo block ;
    echo "";
fi

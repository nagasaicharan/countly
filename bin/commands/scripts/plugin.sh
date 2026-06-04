#!/bin/bash
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m'

if [[ "$USEROVO_CONFIG__SYMLINKED" == "true" ]]; then
    NODE_CMD="nodejs --preserve-symlinks --preserve-symlinks-main"
else
    NODE_CMD="nodejs"
fi
usage (){
    echo "";
    echo "userovo plugin usage:";
    echo "    userovo plugin list                   # list plugins";
    echo "    userovo plugin list states            # list plugins and their states";
    echo "    userovo plugin enable <pluginname>    # enables plugin";
    echo "    userovo plugin disable <pluginname>   # disables plugin";
    echo "    userovo plugin upgrade <pluginname>   # run plugin install script";
    echo "    userovo plugin status <pluginname>    # status of plugin";
    echo "    userovo plugin version <pluginname>   # version of plugin";
}

if [ "$1" = "list" ]; then
    for d in "$DIR"/../../../plugins/*/; do
        if [ "$2" = "states" ]; then
            PLUGIN="$(basename "$d")" ;
            if grep -Fq "\"$PLUGIN\"" "$DIR/../../../plugins/plugins.json"
            then
                printf "  %s =%b enabled %b\n" "$PLUGIN" "$GREEN" "$NC";
            else
                printf "  %s =%b disabled %b\n" "$PLUGIN" "$RED" "$NC";
            fi
        else
            echo "  $(basename "$d")";
        fi
    done
elif [ "$1" = "new" ]; then
    if [ ! -d "$DIR"/../../../plugins/empty ] ; then
        echo "Plugin empty does not exist, can't create new plugin"
    elif [ -z "$2" ] ; then
        echo "Please provide new plugin name"
    elif [[ "$2" == *.* ]] ; then
        echo "Plugin name cannot contain dot"
    elif [ -d "$DIR"/../../../plugins/"$2" ] ; then
        echo "Plugin with name $2 already exists"
    else
        cp -rf "$DIR"/../../../plugins/empty/ "$DIR"/../../../plugins/"$2"
        plugin_dir=$(cd "$DIR"/../../../plugins/"$2"; pwd)
        sed -i -e "s/userovo-empty/userovo-$2/g" "$plugin_dir"/package.json
        rm -rf "$plugin_dir"/frontend/public/localization/empty.properties
        echo "#$2" > "$plugin_dir"/frontend/public/localization/"$2".properties
        echo "" >> "$plugin_dir"/frontend/public/localization/"$2".properties
        echo "Enter plugin title:"
        read -r title;
        sed -i -e "s/\"title\": \"Plugin template\"/\"title\": \"$title\"/g" "$plugin_dir"/package.json
        echo "$2.plugin-title = $title" >> "$plugin_dir"/frontend/public/localization/"$2".properties
        echo "Enter plugin description:"
        read -r description;
        sed -i -e "s/\"description\": \"Empty plugin template for creating new plugins\"/\"description\": \"$description\"/g" "$plugin_dir"/package.json
        echo "$2.plugin-description = $description" >> "$plugin_dir"/frontend/public/localization/"$2".properties
        echo "Finished creating plugin in $plugin_dir"
        echo "Happy coding!"
    fi
elif [ -d "$DIR/../../../plugins/$2" ]; then
    if [ "$1" = "enable" ]; then
        $NODE_CMD "$DIR/plugin.js" enable "$2" ;
    elif [ "$1" = "disable" ]; then
        $NODE_CMD "$DIR/plugin.js" disable "$2" ;
    elif [ "$1" = "upgrade" ]; then
        $NODE_CMD "$DIR/plugin.js" upgrade "$2" ;
    elif [ "$1" = "status" ]; then
        if grep -Fq "\"$2\"" "$DIR/../../../plugins/plugins.json"
        then
            echo "enabled"
        else
            echo "disabled"
        fi
    elif [ "$1" = "version" ]; then
        grep -oP '"version":\s*"\K[0-9\.]*' "$DIR/../../../plugins/$2/package.json" ;
    elif [ "$1" = "test" ]; then
        userovo plugin lint "$2";
        shift;
        $NODE_CMD "$DIR/plugin.js" test "$@" ;
    elif [ "$1" = "lint" ]; then
        cd "$DIR/../../../";
        "$DIR/../../../node_modules/eslint/bin/eslint.js" -c "$DIR/../../../.eslintrc.json" --ignore-path "$DIR/../../../.eslintignore" "$DIR/../../../plugins/$2/." ;
    elif [ "$1" = "lintfix" ]; then
        cd "$DIR/../../../";
        "$DIR/../../../node_modules/eslint/bin/eslint.js" -c "$DIR/../../../.eslintrc.json" --ignore-path "$DIR/../../../.eslintignore" "$DIR/../../../plugins/$2/." --fix;
    else
        usage ;
    fi
else
    echo "Plugin $2 does not exist";
fi
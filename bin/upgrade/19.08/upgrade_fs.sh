#!/bin/bash

echo "Running filesystem modifications"

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )/../.." && pwd )"
CUR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

#enable command line
bash "$DIR/scripts/detect.init.sh"


#remove predefined locale file, it should fallback to default one
rm -rf "$DIR/../frontend/express/public/localization/min/locale_en.properties"

#run upgrade scripts
bash "$CUR/scripts/remove_chrome_cache.sh"
bash "$CUR/scripts/remove_flash_corssorigin.sh"

#upgrade plugins
(cd "$DIR/../" && npm install --unsafe-perm)
userovo plugin upgrade crashes
userovo plugin upgrade push
(cd "$DIR/../plugins/push/api/parts/apn" && npm install --unsafe-perm)
userovo plugin upgrade systemlogs
userovo plugin disable live
userovo plugin enable concurrent_users
userovo plugin enable formulas
userovo plugin enable ab-testing
#replace totp with two-factor-aut
STATE=$(userovo plugin status  totp);
if [ "$STATE" == "enabled" ] 
then
    userovo plugin disable  totp ;
    userovo plugin enable two-factor-auth ;
fi

#install dependencies, process files and restart userovo
userovo upgrade
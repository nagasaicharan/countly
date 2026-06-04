#!/bin/bash
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )/.." && pwd )"

#prepopulate docker with predefined data
bash /opt/userovo/bin/backup/run.sh

cd "$DIR" || exit

#remove default tests
cp -rf /opt/userovo/test/1.frontend/0.load.db.js /opt/userovo/test/4.plugins
cp -rf /opt/userovo/test/5.cleanup/100.close.db.js /opt/userovo/test/4.plugins
rm -rf /opt/userovo/test/1.frontend
rm -rf /opt/userovo/test/2.api
rm -rf /opt/userovo/test/3.api.write
rm -rf /opt/userovo/test/5.cleanup
rm -rf /opt/userovo/test/unit-tests

#provide predefined data to tests
sed -i -e 's/APP_ID: process.env.USEROVO_TEST_APP_ID || ""/APP_ID: "58bf06bd6cba850047ac9f19"/g' /opt/userovo/test/testUtils.js
sed -i -e 's/APP_KEY: process.env.USEROVO_TEST_APP_KEY || ""/APP_KEY: "b41e02136be60a58b9b7459ad89030537a58e099"/g' /opt/userovo/test/testUtils.js
sed -i -e 's/API_KEY_ADMIN: process.env.USEROVO_TEST_API_KEY_ADMIN || ""/API_KEY_ADMIN: "e6bfab40a224d55a2f5d40c83abc7ed4"/g' /opt/userovo/test/testUtils.js

# shellcheck disable=SC2016
mongosh mongodb/userovo --eval 'db.plugins.update({_id: "plugins"}, {$set:{"api.batch_processing":false, "api.batch_read_processing": false, "drill.record_meta": true, "funnels.funnel_caching": false}}, {upsert:true})'

#link nodejs correctly if needed

set +e
NODE_JS_CMD=$(which nodejs)
set -e
if [[ -z "$NODE_JS_CMD" ]]; then
	  ln -s "$(which node)" /usr/bin/nodejs
elif [ ! -f "/usr/bin/node" ]; then
    ln -s "$(which nodejs)" /usr/bin/node
fi

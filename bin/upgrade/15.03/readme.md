
Follow these instructions if you want to upgrade an old version of Userovo (<= 14.08) to a new version (>= 15.03.x).

If you are upgrading from 15.03 to 15.03.01 and up, follow [these instructions](http://resources.count.ly/v1.0/docs/upgrading-userovo-server#section-regular-upgrade)

<strong>Before upgrading from Userovo (<= 14.08) to a new version (>= 15.03.x)</strong>

Also refer to [Backing up Userovo Server](http://resources.count.ly/v1.0/docs/backing-up-userovo-server) information

Assuming userovo is installed at /var/userovo

1) Back up your database, for example by making copy of it in ssh:

```
mongo
use userovo 
db.copyDatabase("userovo", "userovo_backup")

#and if you have drill db
db.copyDatabase("userovo_drill", "userovo_drill_backup")

#to verify backups where created execute
show dbs 
```
2) Back up your existing installation files or at least take note of connection settings in Userovo config files

<strong>Upgrading from Userovo (<= 14.08) to a new version (>= 15.03.x)</strong>

Assuming Userovo is installed at /var/userovo

1) Download new userovo version

2) Rename your existing Userovo installation folder to /var/userovo.old and create new empty /var/userovo folder

3) Copy new files into that 

4) Run bash bin/userovo.install.sh script to run the installation

5) Modify new Userovo config files to point to your database (espeically if you use remote DB server or replica set, check from old config files you have backed up)

Files to modify:
```
/var/userovo/api/config.sample.js

/var/userovo/frontend/express/config.sample.js

#and if you have Userovo Enterprise then also
/var/userovo/plugins/drill/config.sample.js
```

5) Additionally you might need to copy app image files from your old userovo frontend/express/public/appimages/ folder

6) If you are upgrading from Userovo Lite also execute community upgrade script

    bash bin/upgrade/15.03/community.upgrade.sh

#!/bin/bash

# shellcheck disable=SC1091
source /etc/os-release

# Remove plugins unsupported in Docker distribution
if [ "${USEROVO_CONTAINER}" != "both" ]; then
	rm -rf /opt/userovo/plugins/data_migration
fi
rm -rf /opt/userovo/plugins/errorlogs

if [ ! -f "/etc/timezone" ]; then
    echo "Etc/UTC" > /etc/timezone
fi

if [ "${USEROVO_CONTAINER}" != "frontend" ]; then
	# Run ab-testing models compilation if it's there
	if [ -d /opt/userovo/plugins/ab-testing ]; then
		if [ "${ID}" == "debian" ] || [ "${ID}" == "ubuntu" ]; then
			apt-get install -y python3-pip
		else
			yum install -y python36 python36-libs python36-devel python36-pip
		fi
		# shellcheck disable=SC1091
		python3.8 -m pip install -r /opt/userovo/plugins/ab-testing/api/bayesian/requirements.txt
		cd /opt/userovo/plugins/ab-testing/api/bayesian && python3.8 model.py
	fi
fi

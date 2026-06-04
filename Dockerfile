FROM phusion/baseimage:focal-1.2.0

ARG USEROVO_PLUGINS=mobile,web,desktop,plugins,density,locale,browser,sources,views,logger,systemlogs,populator,reports,crashes,push,star-rating,slipping-away-users,compare,server-stats,dbviewer,times-of-day,compliance-hub,alerts,onboarding,consolidate,remote-config,hooks,dashboards,sdk,data-manager,guides
# Userovo Enterprise:
#ARG USEROVO_PLUGINS=mobile,web,desktop,plugins,density,locale,browser,sources,views,license,drill,funnels,retention_segments,flows,cohorts,surveys,remote-config,ab-testing,formulas,activity-map,concurrent_users,revenue,logger,systemlogs,populator,reports,crashes,push,geo,block,users,star-rating,slipping-away-users,compare,server-stats,dbviewer,crash_symbolication,crashes-jira,groups,white-labeling,alerts,times-of-day,compliance-hub,onboarding,active_users,performance-monitoring,config-transfer,consolidate,data-manager,hooks,dashboards,heatmaps,sdk,guides,journey_engine,content

ARG USEROVO_CONFIG_API_MONGODB_HOST=localhost
ARG USEROVO_CONFIG_FRONTEND_MONGODB_HOST=localhost

ARG DEBIAN_FRONTEND=noninteractive
ARG TZ=Etc/UTC

CMD ["/sbin/my_init"]

## Setup Userovo
ENV USEROVO_CONTAINER="both" \
    USEROVO_DEFAULT_PLUGINS="${USEROVO_PLUGINS}" \
    USEROVO_CONFIG_API_API_HOST="0.0.0.0" \
    USEROVO_CONFIG_FRONTEND_WEB_HOST="0.0.0.0" \
    NODE_OPTIONS="--max-old-space-size=2048" \
    INSIDE_DOCKER=1

EXPOSE 80
USER root

## Add MongoDB data volume
VOLUME ["/var/lib/mongodb"]

COPY / /opt/userovo

RUN apt-get update && apt-get install -y sudo && \
	/opt/userovo/bin/userovo.install.sh && \
    rm /usr/bin/systemctl && \
    chown -R mongodb:mongodb /var/lib/mongodb && \
    \
    mkdir /etc/service/mongodb && \
    mkdir /etc/service/nginx && \
    mkdir /etc/service/userovo-api && \
    mkdir /etc/service/userovo-dashboard && \
    echo "" >> /etc/nginx/nginx.conf && \
    echo "daemon off;" >> /etc/nginx/nginx.conf && \
    \
    cp /opt/userovo/bin/commands/docker/mongodb.sh /etc/service/mongodb/run && \
    cp /opt/userovo/bin/commands/docker/nginx.sh /etc/service/nginx/run && \
    cp /opt/userovo/bin/commands/docker/userovo-api.sh /etc/service/userovo-api/run && \
    cp /opt/userovo/bin/commands/docker/userovo-dashboard.sh /etc/service/userovo-dashboard/run && \
    \
    chown mongodb /etc/service/mongodb/run && \
	chown root /etc/service/nginx/run && \
	chown -R userovo:userovo /opt/userovo && \
    \
    apt-get autoremove -y && \
    apt-get install -y gconf-service libasound2 libatk1.0-0 libc6 libcairo2 libcups2 libdbus-1-3 libexpat1 libfontconfig1 libgcc1 libgconf-2-4 libgdk-pixbuf2.0-0 libglib2.0-0 libgtk-3-0 libnspr4 libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 libxtst6 ca-certificates fonts-liberation libappindicator1 libnss3 lsb-release xdg-utils && \
    apt-get clean && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/* && \
    rm -rf /tmp/* /tmp/.??* /var/tmp/* /var/tmp/.??* /root/.npm && \
    mkdir -p /opt/userovo/.npm && chown -R 1001:0 /opt/userovo/.npm

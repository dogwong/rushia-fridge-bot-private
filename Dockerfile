# BUILD IMAGE
# 1. pull
# 2. run "git update-index --chmod=+x <.sh file>" on Windows and commit push permission change
# (2. server side: chmod +x docker-entrypoint.sh)
# 3. check .env exists
# docker build -t rushia-fridge-bot:latest .
### docker image rm rushia-fridge-bot

# docker run -it --name rushia-fridge-bot --restart always -v /usr/src/rushia-fridge-bot:/usr/src/rushia-fridge-bot rushia-fridge-bot:latest --log-driver local --log-opt max-size=10m --log-opt max-file=3
# or --restart on-failure



FROM node:16-alpine3.11
RUN apk add git

VOLUME [ "/usr/src/rushia-fridge-bot" ]
WORKDIR /usr/src/rushia-fridge-bot

# COPY docker-entrypoint.sh /

ENV NODE_PATH=.
ENTRYPOINT ["/usr/src/rushia-fridge-bot/docker-entrypoint.sh"]

# CMD ["node", "index.js"]


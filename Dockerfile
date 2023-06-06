# BUILD IMAGE
# 1. pull
# 2. run "git update-index --chmod=+x <.sh file>" on Windows and commit push permission change
# (2. server side: chmod +x docker-entrypoint.sh)
# 3. check .env exists
# docker build -t rushia-fridge-bot:latest .
### docker image rm rushia-fridge-bot
# 4. confirm not using local env, eg require("dotenv").config({ path: "local-dev.env" });

# docker run -it --name rushia-fridge-bot --restart always -v /usr/src/rushia-fridge-bot:/usr/src/rushia-fridge-bot rushia-fridge-bot:latest --log-driver local --log-opt max-size=10m --log-opt max-file=3
# or --restart on-failure

# v2 hosting
# docker build --no-cache -t rushia-fridge-bot:1.0.1 -t rushia-fridge-bot:latest .

FROM node:16-alpine3.11
# RUN apk add git

ARG buildno=0
ARG commit_sha
# ENV APP_VERSION=$BUILD_NUM

# VOLUME [ "/usr/src/rushia-fridge-bot" ]
WORKDIR /usr/src/rushia-fridge-bot

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

RUN npm install
# If you are building your code for production
# RUN npm ci --omit=dev

# Bundle app source
COPY . .

# COPY docker-entrypoint.sh /

# ENV NODE_PATH=.
# ENTRYPOINT ["/usr/src/rushia-fridge-bot/docker-entrypoint.sh"]

RUN echo $buildno > buildinfo
RUN echo $commit_sha >> buildinfo
RUN echo $(date +%s) >> buildinfo

# RUN cat buildinfo
RUN echo buildno = $buildno
RUN echo sha = $commit_sha
RUN echo build info = 
RUN cat buildinfo

CMD ["node", "index.js"]


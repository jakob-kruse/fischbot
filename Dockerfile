FROM node:14.11.0-stretch-slim

WORKDIR /usr/src/app

COPY package.json ./
COPY yarn.lock ./

RUN [ "yarn", "install", "--check-files", "--frozen-lockfile" ]

ADD . .

CMD [ "yarn", "run:prod" ]
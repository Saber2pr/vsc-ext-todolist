# node
FROM node:14.18-alpine

WORKDIR /app
COPY . /app

# npm
RUN yarn install --network-timeout 600000
RUN yarn build

# script
CMD [ "yarn", "serve" ]
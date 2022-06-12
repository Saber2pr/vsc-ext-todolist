# node
FROM node:14.18-alpine

WORKDIR /app
COPY . /app

RUN yarn install --network-timeout 600000

RUN cd web && yarn install --network-timeout 600000 && yarn build

RUN rm -rf ./node_modules

# script
CMD [ "yarn", "serve" ]
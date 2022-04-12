# build environment
FROM node:16-buster as build
WORKDIR /app

ENV PATH /app/node_modules/.bin:$PATH

COPY package.json ./
COPY yarn.lock ./

RUN yarn install

COPY . ./

RUN yarn build

# production environment
FROM node:16-buster-slim
WORKDIR /app

ENV PATH /app/node_modules/.bin:$PATH
ENV NODE_ENV=production

COPY package.json ./
COPY yarn.lock ./

RUN yarn install --production

COPY --from=build /app/dist ./dist

EXPOSE 4000

CMD ["yarn", "start:prod"]

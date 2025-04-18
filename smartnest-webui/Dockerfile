FROM node:18-alpine AS base

RUN mkdir /app
WORKDIR /app

COPY package*.json ./
RUN npm install

FROM base AS dev

ADD . /app/
CMD ["npm", "start"]

FROM base AS prod

ADD . /app/
RUN npm run build
RUN npm install -g serve

CMD ["serve", "-s", "build"]



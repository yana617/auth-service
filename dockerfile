FROM node:14.17.0
LABEL maintainer="jana.ru.sidorova@yandex.ru"
ENV NODE_ENV=production PORT=8080

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install --production

COPY . .

EXPOSE 8080
CMD [ "npm", "start" ]
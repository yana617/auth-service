FROM node:14.17.0
LABEL maintainer="jana.ru.sidorova@yandex.ru"
ENV NODE_ENV=production PORT=1081

WORKDIR /usr/src/auth-serive

COPY package*.json ./

RUN npm install --production

COPY . .

EXPOSE 1081
CMD [ "npm", "start" ]
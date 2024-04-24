FROM node:18.20.2
LABEL maintainer="jana.ru.sidorova@yandex.ru"
ENV NODE_ENV=production PORT=1081

WORKDIR /usr/src/auth-service

COPY package*.json ./

RUN npm install --omit=dev

COPY . .

EXPOSE 1081

COPY ./bin/prod-docker-entrypoint.sh /bin/prod-docker-entrypoint.sh

RUN chmod +x /bin/prod-docker-entrypoint.sh

ENTRYPOINT ["/bin/prod-docker-entrypoint.sh"]
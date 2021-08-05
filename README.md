# NodeJS Express Boilerplate

### To run tests
```
docker-compose run --rm app npm test
```

### To run in development mode
```
docker compose up --build
```

### To run in production mode
```
docker build . -t boileplate-nodejs-image
docker run --name boileplate-nodejs -d -p 7799:7799 boileplate-nodejs-image
```

### Create new db model
```
sequelize model:generate --name User --attributes name:string,surname:string
```

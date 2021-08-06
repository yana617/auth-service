# Auth service for house-of-souls-ui

### To run tests
```
npm run test:docker
```

### To run
```
docker compose up --build
```

### Create new db model
```
sequelize model:generate --name User --attributes name:string,surname:string
```

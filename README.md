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

### Updating swagger
Add new swagger path or schema files in **documentation/** folder

Then run
```
npm install -g swagger-cli
swagger-cli bundle documentation/swagger.yaml --outfile swagger.yaml --type yaml
```
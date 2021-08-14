docker-compose up -d postgres-db

WAIT_FOR_PG_ISREADY="while ! pg_isready --quiet; do sleep 1; done;"
docker-compose exec postgres-db bash -c "$WAIT_FOR_PG_ISREADY"

export POSTGRES_USERNAME=postgres
export POSTGRES_PASSWORD=postgres
export POSTGRES_PORT=5432
export POSTGRES_DB=test-db
npx sequelize-cli db:drop
npx sequelize-cli db:create
npx sequelize-cli db:migrate
npx sequelize-cli db:seed:all

echo "start running tests"
jest --coverage --runInBand
echo "tearing down all containers"

docker-compose stop
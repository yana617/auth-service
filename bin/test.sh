docker-compose up -d postgres-db

WAIT_FOR_PG_ISREADY="while ! pg_isready --quiet; do sleep 1; done;"
docker-compose exec postgres-db bash -c "$WAIT_FOR_PG_ISREADY"

docker-compose exec postgres-db su - postgres -c "psql test-db -c '' ||  createdb test-db"

echo "start running tests"
jest --coverage
echo "tearing down all containers"

docker-compose exec postgres-db \
  su - postgres -c "psql -c '' || removedb test-db"
docker-compose stop
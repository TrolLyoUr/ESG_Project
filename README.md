## Brief description

* Document: database definition, formula used for calculate esg performance
* esg_management_system: back end
* new_vision: front end

## Deploy method

### build and start program

1. download program to "product"(recommend) folder: `git clone xxx product`
2. `docker build . -t studentitp:latest`
3. `docker compose up -d`

### initialize database

1. `docker exec -it product-web-1 bash`
2. reload database
   ```
   export PGHOST=db
   export PGUSER=postgres
   export PGPASSWORD=99009900
   ```
    1. load environment variable
    2. load database `psql esg < database.sql`

## Enjoy our system!
#!/bin/bash

# Wait until Postgres is ready
until pg_isready -h db -p 5432 -U postgres; do
  echo "Waiting for Postgres..."
  sleep 1
done

# Run migrations
python3 manage.py migrate

# Run any additional commands like importing data or populating metrics
python3 manage.py import_esg_data data_set
python3 manage.py populate_metrics

# Finally, start the Django development server
exec python3 manage.py runserver 0.0.0.0:8000

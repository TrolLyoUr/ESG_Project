## Deploy instruction

1. docker compose up -d
2. docker exec -it capstone-web-1 bash
3. python3 manage.py makemigrations
4. python3 manage.py migrate
5. python3 manage.py createsuperuser
6. for f in $(ls data_set/*.csv); do python3 manage.py import_esg_data $f; done
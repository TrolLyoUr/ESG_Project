## Deploy instruction

1. python3 manage.py migrate
2. python3 manage.py makemigrations
3. python3 manage.py createsuperuser
4. for f in $(ls data_set/*.csv); do python3 manage.py import_esg_data $f; done
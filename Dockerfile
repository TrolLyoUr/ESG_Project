FROM ubuntu:22.04
# RUN apt update; apt install python3 python3-pip git npm libpq-dev pkg-config -y;
RUN apt update; apt install python3 python3-pip git libpq-dev pkg-config -y;
COPY /root/product/esg_management_system /root/product
WORKDIR /root/product
RUN pip install psycopg2-binary; pip3 install -r re.txt;
CMD ["python3", "manage.py", "runserver", "0.0.0.0:8000"]

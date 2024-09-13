FROM ubuntu:22.04
RUN apt update && apt install -y python3 python3-pip git libpq-dev pkg-config postgresql-client
COPY esg_management_system /root/product
WORKDIR /root/product

# Install Python dependencies
RUN pip install psycopg2-binary && pip3 install -r re.txt

# Copy the entrypoint script and make it executable
COPY entrypoint.sh /root/product/entrypoint.sh
RUN chmod +x /root/product/entrypoint.sh

# Set entrypoint script
ENTRYPOINT ["/root/product/entrypoint.sh"]

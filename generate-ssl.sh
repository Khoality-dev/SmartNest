#!/bin/bash

# Create ssl directory if it doesn't exist
mkdir -p ssl

# Change ownership to current user
sudo chown -R $USER:$USER ssl

# Generate self-signed SSL certificate
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout ssl/key.pem \
    -out ssl/cert.pem \
    -subj "/C=US/ST=State/L=City/O=SmartNest/CN=localhost"

# Set proper permissions
chmod 644 ssl/cert.pem
chmod 600 ssl/key.pem

echo "SSL certificates generated successfully in ./ssl/"

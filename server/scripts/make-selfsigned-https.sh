#! /bin/bash

# This command is for dev servers only! You should use this to
# create a self-signed HTTPS certificate for local dev.
# That is it. This is not secure.
mkdir -p cert

yes "" | openssl req -x509 -newkey rsa:4096 -keyout ./cert/key.pem -out ./cert/cert.pem -sha256 -days 365 --nodes &> /dev/null

echo "Created HTTPS Certificates!"
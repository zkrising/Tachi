#!/bin/bash

for file in /tachi/dev/deb/*.deb; do
	apt install -y "$file"
done
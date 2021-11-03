#!/bin/bash

hostname=$(hostname)
ip=$(hostname -i)

cp /etc/hosts ~/hosts

sed -i 's/127\.0\.0\.1  /127\.0\.0\.1   localhost.localdomain /' ~/hosts
sed -i "s/${ip} /${ip}  ${hostname}.localdomain /" ~/hosts

cp ~/hosts /etc/hosts
rm ~/hosts

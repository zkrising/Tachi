#!/bin/bash

# a script for making tachi's anonymised datasets.
# designed to run on my machine
# 
# you are expected to have pnpm, mongo etc. in path.

set -eox pipefail

SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
cd "$SCRIPT_DIR";
cd ../server;

# stuff based on my local system, modify as wished
remote_port=12345
target=../../tachi-datasets/datasets

for kind in "kamai" "boku"; do
	mongosh --eval "use anon-$kind" --eval "db.dropDatabase()"

	mongodump --archive --port=$remote_port --db=$kind | mongorestore --archive --nsFrom="$kind.*" --nsTo="anon-$kind.*"

	ts-node src/scripts/anonymise-db 127.0.0.1:27017/anon-$kind

	TCHIS_CONF_LOCATION=$kind.dataset.conf.json5 pnpm set-indexes

	mongodump --db=anon-$kind --archive="$target/anon-$kind-$(date +%Y-%m).dump" --gzip
done;
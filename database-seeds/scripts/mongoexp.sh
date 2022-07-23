#! /bin/bash

# Exports data from a mongodb instance back to the collections
# folder.
# Useful for backporting updates, or something.

set -eo pipefail

cd "$(dirname "${BASH_SOURCE[0]}")"

if [ -z "$1" ] || [ -z "$2" ]; then
	echo "Usage: mongoexp.sh <collection> <dbname>"
	exit
fi

mongoexport -d "$2" -c "$1" --jsonArray > ../collections/"$1".json

node remove-_id.js
node deterministic-collection-sort.js
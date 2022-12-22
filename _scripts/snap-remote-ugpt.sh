#!/bin/bash

# Copy a user from a remote Tachi instance and import it locally.
# This script is intended for users who have MongoDB access to said remote Tachi instance.

if [ -z "$1" ] || [ -z "$2" ] || [ -z "$3" ]; then
	echo "Usage 'snap-remote-ugpt.sh <userID> <game> <playtype>"
	exit 1
fi

mongoexport mongodb://127.0.0.1:12345/ktchidb --jsonArray -c users -q "{ \"userID\": $1 }" | jq 'map(del(._id))' | mongoimport mongodb://127.0.0.1:27017/localdb --jsonArray -c users

for collection in "game-stats" "scores" "sessions" "personal-bests"; do
	mongoexport mongodb://127.0.0.1:12345/ktchidb --jsonArray -c "$collection" -q "{ \"userID\": $1, \"game\": \"$2\", \"playtype\": \"$3\" }" | jq 'map(del(._id))' | mongoimport mongodb://127.0.0.1:27017/localdb --jsonArray -c "$collection"
done

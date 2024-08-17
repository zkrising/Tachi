mod seeds
mod server
mod client
mod docs

[private]
interactive:
	-@just --choose

# Run the frontend and backend for Tachi.
#
# This is the main command you want to use to start up tachi. Go for it!
start:
	parallel --lb ::: 'FORCE_COLOR=1 just server start' 'FORCE_COLOR=1 just client start'

# test everything
test:
	just server test
	just client test
	just seeds test

latest_dataset := "2024-05"
# Load the latest Kamaitachi dataset. This is put in the "anon-kamai" database. 
load-kamai-dataset:
	wget -O- https://cdn-kamai.tachi.ac/datasets/{{latest_dataset}}.dump | mongorestore --uri='mongodb://mongo' --gzip --archive

	echo "Successfully loaded. You should change 'server/conf.json5' to use anon-kamai as the database."

# Load the latest Bokutachi dataset. This is put in the "anon-boku" database. 
load-boku-dataset:
	wget -O- https://cdn-boku.tachi.ac/datasets/{{latest_dataset}}.dump | mongorestore --uri='mongodb://mongo' --gzip --archive

	echo "Successfully loaded. You should change 'server/conf.json5' to use anon-boku as the database."

# Check that the data in MongoDB makes any sense.
validate-db:
	cd server/ && pnpm validate-database

# reload the shell setup
setup-fish:
	@fish dev/setup.fish

	@exec fish

# force a re-bootstrap
bootstrap:
	-@rm BOOTSTRAP_OK
	./dev/bootstrap.sh
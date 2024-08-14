mod seeds

default:
	-@just --choose

# run the server and client at the same time...
start:
	parallel --lb ::: 'just server' 'just client'

# test everything
test:
	just test-server
	just test-seeds

# Check that the data in MongoDB makes any sense.
validate-db:
	cd server/ && pnpm validate-database

# start just the server
server:
	cd server/ && pnpm dev

# start just the client
client:
	cd client/ && pnpm dev

# start just the docs
docs:
	cd docs/ && mkdocs serve -a 0.0.0.0:3001

sort-seeds:
	node seeds/scripts/deterministic-collection-sort.js

test-seeds:
	cd seeds/scripts && pnpm test

test-server:
	cd server/ && pnpm test

test-client:

setup-fish:
	fish dev/setup.fish

# force a re-bootstrap
bootstrap:
	rm I_HAVE_BOOTSTRAPPED_OK
	./_scripts/bootstrap.sh
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

test-server:
	cd server/ && pnpm test

# Test that the client compiles and passes the linter.
test-client:
	cd client/ && pnpm typecheck
	cd client/ && pnpm lint

# Check that the data in MongoDB makes any sense.
validate-db:
	cd server/ && pnpm validate-database



# reload the shell setup
setup-fish:
	fish dev/setup.fish

# force a re-bootstrap
bootstrap:
	rm I_HAVE_BOOTSTRAPPED_OK
	./_scripts/bootstrap.sh
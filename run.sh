#!/bin/bash

if ! which docker >/dev/null; then
	echo "Docker isn't installed. Please install docker!"
	exit 1
fi

cmd=${1:-start}

echo "running $cmd"

set -eo pipefail

case "$cmd" in 
	start)
		docker compose -f docker-compose-dev.yml up --build -d
		echo "Go to http://127.0.0.1:3000 to view Tachi!"
		echo "Go to http://127.0.0.1:3001 to view Tachi's Documentation!"
		;;
	stop)
		docker compose -f docker-compose-dev.yml down
		;;
	logs-server)
		docker logs tachi-server -f
		;;
	logs-client)
		docker logs tachi-client -f
		;;
	logs-seeds)
		docker logs tachi-seeds -f
		;;
	test-server)
		docker exec tachi-server pnpm test
		;;
	test-seeds)
		docker exec tachi-seeds pnpm --filter ./scripts test
		;;
	enter-seeds)
		docker exec tachi-seeds bash
		;;
	sort-seeds)
		docker exec tachi-seeds node scripts/deterministic-collection-sort.js
		;;
	load-seeds)
		docker exec tachi-server pnpm sync-database-local
		;;
	validate-db)
		docker exec tachi-server pnpm validate-database
		;;
	*)
		echo "Unknown command $cmd"
		exit 1
		;;
esac
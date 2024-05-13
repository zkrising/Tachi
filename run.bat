@echo off

where docker > nul 2>&1

if %errorlevel% NEQ 0 (
	echo Docker isn't installed. Please install docker!
	pause
	exit 1
)

if "%1"=="" (
	set "cmd=start"
) else (
	set "cmd=%"
)

echo "running %cmd%"

if "%cmd%" == "start" (
	docker compose -f docker-compose-dev.yml up --build -d
	echo "Go to http://127.0.0.1:3000 to view Tachi!"
	echo "Go to http://127.0.0.1:3001 to view Tachi's Documentation!"
	echo "Run 'run.bat enter-seeds' to get a terminal for working on the seeds."
) else if "%cmd%" == "stop" (
	docker compose -f docker-compose-dev.yml down
) else if "%cmd%" == "logs-server" (
	docker logs tachi-server -f
) else if "%cmd%" == "logs-client" (
	docker logs tachi-client -f
) else if "%cmd%" == "logs-seeds" (
	docker logs tachi-seeds -f
) else if "%cmd%" == "test-server" (
	docker exec tachi-server pnpm test
) else if "%cmd%" == "test-seeds" (
	docker exec tachi-seeds pnpm --filter ./scripts test
) else if "%cmd%" == "enter-seeds" (
	docker exec -it tachi-seeds bash
) else if "%cmd%" == "sort-seeds" (
	docker exec tachi-seeds node scripts/deterministic-collection-sort.js
) else if "%cmd%" == "load-seeds" (
	docker exec tachi-server pnpm sync-database-local
) else if "%cmd%" == "validate-db" (
	docker exec tachi-server pnpm validate-database
) else (
	echo "Unknown command %cmd%: Exiting."
	pause
	exit 1
)

pause

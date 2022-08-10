#! /bin/bash

set -eo pipefail

# https://stackoverflow.com/questions/59895/how-can-i-get-the-directory-where-a-bash-script-is-located-from-within-the-scrip
# if you actually think bash is a good programming language you are
# *straight up delusional*
SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )

cd "$SCRIPT_DIR";
cd ..;

function mvExampleFiles {
	echo "Moving example config files into usable places..."

	cp client/example/.env client/.env

	cp server/example/conf.json5 server/conf.json5
	cp server/example/.env server/.env

	cp bot/example/conf.json5 bot/conf.json5
	cp bot/example/example.env bot/.env

	echo "Moved!"
}

function selfSignHTTPS {
	echo "Self-Signing HTTPS Certificates for local-dev server..."

	# This is for dev servers only! You should use this to
	# create a self-signed HTTPS certificate for local dev.
	# That is it. This is not secure.
	mkdir -p server/cert

	openssl req -x509 -newkey rsa:4096 -keyout server/cert/key.pem -out server/cert/cert.pem -sha256 -days 365 -nodes -subj "/C=AU/ST=TachiExample/L=TachiExample/O=TachiExample/CN=127.0.0.1" &> /dev/null

	echo "Created HTTPS Certificates!"
}

function pnpmInstall {
	echo "Installing dependencies..."

	if ! command -v pnpm &> /dev/null
	then
		echo "Couldn't find pnpm. Can't install dependencies. Install it with npm install -g pnpm."
		exit 1
	fi

	pnpm install

	echo "Installed dependencies."
}

function syncDatabaseWithSeeds {
	echo "Syncing database with seeds..."

	cd server

	pnpm run sync-database

	echo "Synced."
}

mvExampleFiles
selfSignHTTPS
pnpmInstall
syncDatabaseWithSeeds


tput setaf 1

cat << EOF
=== READ THIS YOU MUPPET ===

YOU ARE USING SELF-SIGNED HTTPS CERTIFICATES.
YOU WILL LIKELY HAVE TO GO TO HTTPS://127.0.0.1:8080 AFTER STARTING TACHI-SERVER.
TELL YOUR BROWSER THESE CERTIFICATES ARE TRUSTED!
OTHERWISE, THE CLIENT WILL FAIL TO LAUNCH, AND WILL JUST BE A WHITE PAGE!
EOF

tput sgr0

cat << EOF
Bootstrapped.
Launch the server with pnpm start-server.
Launch the client with pnpm start-client.
EOF

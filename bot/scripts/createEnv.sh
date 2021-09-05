#!/usr/bin/env bash
DOT_ENV_PATH="$(dirname "$0")/../.env"

# Wipe existing file
rm "$DOT_ENV_PATH" 2> /dev/null

# Setup env based on $ENV
if [[ "$ENV" != "PROD" ]]; then
  # Non-prod environment
  echo "ENV=DEV" >> "$DOT_ENV_PATH"
  echo "DISCORD_TOKEN=${NON_PROD_DISCORD_TOKEN:-"_"}" >> "$DOT_ENV_PATH"
  echo "DEV_SERVER_ID=883949913887612938" >> "$DOT_ENV_PATH" # Where is testing taking place?
else
  # Prod environment
  echo "ENV=PROD" >> "$DOT_ENV_PATH"
  echo "DISCORD_TOKEN=${PROD_DISCORD_TOKEN:-"_"}" >> "$DOT_ENV_PATH"
fi

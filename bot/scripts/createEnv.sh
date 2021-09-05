#!/usr/bin/env bash
DOT_ENV_PATH="$(dirname "$0")/../.env"

# Wipe existing file
rm "$DOT_ENV_PATH" 2> /dev/null

# Setup env based on $ENV
if [[ "$ENV" != "PROD" ]]; then
  # Non-prod environment
  echo "ENV=DEV" >> "$DOT_ENV_PATH"
  echo "DISCORD_TOKEN=${NON_PROD_DISCORD_TOKEN:-"_"}" >> "$DOT_ENV_PATH"
  echo "BOT_CLIENT_SECRET=${NON_PROD_BOT_CLIENT_SECRET:-"_"}" >> "$DOT_ENV_PATH"
  echo "BOT_CLIENT_ID=${NON_PROD_BOT_CLIENT_ID:-"_"}" >> "$DOT_ENV_PATH"
else
  # Prod environment
  echo "ENV=PROD" >> "$DOT_ENV_PATH"
  echo "DISCORD_TOKEN=${PROD_DISCORD_TOKEN:-"_"}" >> "$DOT_ENV_PATH"
  echo "BOT_CLIENT_SECRET=${PROD_BOT_CLIENT_SECRET:-"_"}" >> "$DOT_ENV_PATH"
  echo "BOT_CLIENT_ID=${PROD_BOT_CLIENT_ID:-"_"}" >> "$DOT_ENV_PATH"
fi

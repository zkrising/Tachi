# Tachi Client

Tachi-Client is the frontend for Tachi.

## Setup

Run `pnpm install` to install dependencies.

### CSS and Submodules

We legally cannot redistribute the source SCSS files for this repository, as they are from
[Metronic](https://preview.keenthemes.com/metronic8/demo2/index.html). Although the codebase itself has been completely cleanly implemented, with no metronic, the SCSS is still
theirs, and we do not have the legal right to redistribute it.

If you are a member of TNG-Dev, you will have access to [tachi-client-scss](https://github.com/tng-dev/tachi-client-scss). This submodule is located at `src/_assets/metronic-scss`.
Cloning this will make that the source of truth for CSS styling. Otherwise, we fall back
to `src/_assets/compiled-css/main.css`. This is legally redistributable compiled (minified)
output from the metronic SCSS.

## Dev Server

`pnpm start` launches a development server for rapid iteration. Use this if you're developing.

## Building

`pnpm build` compiles the source code into `build/`. This directory can then be shipped around and
served by tools like nginx. This should be used for production use cases only, as
compiling the client takes around 20-30 seconds, whereas the dev server is near instant.

## Config

For local development, spawn an instance of [tachi-server](https://github.com/tng-dev/tachi-server). Create a `.env` file with atleast the following content:

```sh
REACT_APP_TCHIC_MODE="omni"
REACT_APP_SERVER_URL="https://127.0.0.1:8080"
REACT_APP_CDN_URL="https://127.0.0.1:8080/cdn"
```

Replace `8080` with a different port if you've changed it in your instance of tachi-server.

Other configuration variables are as follows:
```sh
# Stop react from launching a browser when you run pnpm start.
BROWSER="none"

# Where IMGScores should be generated from.
REACT_APP_IMGSCORE_URL=""

# KAI API Client IDs.
REACT_APP_EAG_CLIENT_ID=""
REACT_APP_MIN_CLIENT_ID=""
REACT_APP_FLO_CLIENT_ID=""

# How long users should have to read the rules for, in seconds.
# Defaults to 30, but useful to lower for localdev.
REACT_APP_RULES_READ_TIME=30
```
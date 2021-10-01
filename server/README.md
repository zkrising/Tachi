# Tachi-Server

[![codecov](https://codecov.io/gh/zkldi/tachi-server/branch/develop/graph/badge.svg?token=RAZSDSH1Y9)](https://codecov.io/gh/zkldi/tachi-server)

Tachi-Server is the backend for Tachi.

Tachi itself is a supercharged Rhythm Game Score Tracker, powering multiple games!

## What's it do?

- Hosts an express backend server.
- Opens a public API on `/api`.
- Supports various IR frameworks under `/ir`
- Powers a ridiculously overengineered score import framework.

## Other Repos

`tachi-server` is one part of the larger Tachi framework. Other repositories include:

[tachi-common](https://github.com/TeamNewGuys/tachi-common): Common Types and Utilities for Tachi. (Stuff that's shared between the client and the server, basically.)

[tachi-docs](https://github.com/TeamNewGuys/tachi-docs): Documentation for Tachi.

[tachi-import-scripts](https://github.com/TeamNewGuys/tachi-import-scripts): A UI for converting local files into Batch-Manual format, then uploading to Tachi..

[tachi-beatoraja-ir](https://github.com/TeamNewGuys/tachi-beatoraja-ir): A beatoraja IR client for integrating with Tachi.

[tachi-database-seeds](https://github.com/TeamNewGuys/tachi-database-seeds): Backbone data for Tachi, such as song and chart information. Free to use.

[tachi-bot](https://github.com/TeamNewGuys/tachi-db-importer): A discord bot that integrates with the Tachi API.

## Where's the client?

The client code is private. However, making a client is *definitely* not the hard part here, and you're completely free to make your own.

## Documentation

[Over here!](https://tachi.rtfd.io)

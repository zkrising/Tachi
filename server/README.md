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

[tachi-common](https://github.com/zkldi/tachi-common): Common Types and Utilities for Tachi. (Stuff that's shared between the client and the server, basically.

[tachi-docs](https://github.com/zkldi/tachi-docs): Documentation for Tachi.

[tachi-db-importer](https://github.com/zkldi/tachi-db-importer): A UI for importing local database files to Tachi.

## Where's the client?

The client code is private. However, making a client is *definitely* not the hard part here, and you're completely free to make your own.

## Documentation

[Over here!](https://tachi.rtfd.io)

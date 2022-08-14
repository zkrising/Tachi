# Tachi

This is the main monorepo for Tachi.

## What is Tachi?

Tachi is a modern, powerful, modular Rhythm Game Score Tracker.

In short, it does the things that people would otherwise make spreadsheets for.

Tachi is a score tracker and analyser for various rhythm games.
It was designed out of a dislike for existing websites that display your scores.
I think that scores are integral to the rhythm game experience, and that displaying them
properly is *just* as important!

By using Tachi, you get access to powerful, novel rhythm game score-tracking features, like automatically breaking your scores into sessions, setting goals and rivals, and more!

There are way more features that Tachi has, and you can read about all of them [here](https://tachi.readthedocs.io/user/features).

## Setup

Check the [Documentation](https://docs-staging.bokutachi.xyz/contributing/setup) for how to set Tachi up.

You can then check the component-specific guides to see how to run those components and contribute back.

## Repository Info

This monorepo contains the following codebases:

- `client/`, Which is a React frontend for Tachi.

The client and the server are fairly decoupled. Someone could trivially create their own frontend client for Tachi.

- `server/`, Which is an Express-Typescript backend for Tachi.

This contains all of our API calls, and interfaces with our database, and powers the actual score import engine.

- `database-seeds/`, Which is a git-tracked set of data to be synced with Tachi.

**This is the source of truth for the songs, charts, and more on the site!**
By submitting PRs to this, you can fix bugs on the website, add new charts, and more.

- `bot/`, Which is a discord bot frontend for Tachi.

- `common/`, Which contains common types, utils and functions shared between all other packages.

This is also published to NPM when it hits production.

- `docs/`, Which contains Tachi documentation.

- `sieglinde/`, Which contains our BMS/PMS analysis functions.
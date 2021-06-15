# Toolchain

This page documents all the various tools involved with
`tachi-server` and why they were chosen specifically.

A lot of this is personal preference, but hopefully the
justifications provide enough insight into why.

*****

## Programming Language: TypeScript

Everything is wrote in [TypeScript](https://www.typescriptlang.org). TypeScript provides
substantial usability improvements for JS at scale,
and integrates very nicely with IDEs.

## Package Manager: pnpm

`pnpm` is the preferred package manager for all `tachi-` projects.

It can be acquired with `npm install -g pnpm`, and documentation can be found [here](https://pnpm.io).

### Why not `npm`?

`npm` duplicates packages across my whole system, and it takes up a lot of package space. Furthermore, each new install requires new network calls, and my internet is pretty poor.

`pnpm` dedupes packages everywhere, and pulls packages from the local cache if possible.

It's also way faster. The developers behind `pnpm` have seriously
put a lot of work into it, and it's a great tool.

## Main Database: MongoDB

We use [MongoDB](https://mongodb.com) because it works nicely with JSON, and has
good support for Javascript and TypeScript.

!!! tip
	If you're debugging MongoDB state, I cannot recommend
	[MongoDB Compass](https://www.mongodb.com/products/compass) enough. It's one of the best ways to interact
	with Mongo and analyse queries.

### Why not SQL?

We take advantage of the more dynamic nature of MongoDB documents in some places to get away with writing less code,
which means a port to SQL is non-trivial.

The document model also meshes nicer with the rest of the codebase.

!!! note
	We also use Redis for sessions and inter-process communication.

## Database Driver: Monk

[Monk](https://github.com/automattic/monk) is a simple wrapper around the MongoDB native NodeJS Driver. Although it's a simple wrapper, it is a massive
UX improvement over the native wrapper.

### Why not Mongoose?

Mongoose mandates schemas, and works with a much more OOP-style
approach to handling documents. I personally think it's an unecessary
abstraction for this project specifically, but is a great library nonetheless.

## Logger: Winston

We use the [Winston](https://github.com/winstonjs/winston) framework to provide logging to the application. You can read more about this in [Logging](./logging).

!!! note
	Winston seems to be an abandoned project. Furthermore,
	the level of documentation is questionable at best.

	Despite this, Winston is an incredibly mature and
	stable logging framework, and is a good fit for
	our project as a result.

## HTTP Client: Express

[Express](https://github.com/expressjs/express) is a battle tested HTTP framework for NodeJS, and
the middleware chain is incredibly useful.

### Why Not Koa or TinyHTTP?

It lacks a lot of the ecosystem Express has - mainly
with regards to testing.

## Test Runner: TAP

[Node TAP](https://node-tap.org) is an opinionated testing framework by the guy
who made NPM.

The opinionated parts of it line up exactly with what I
want from a testing library, and it has batteries included for everything I want.

This also handles our coverage reports by calling `nyc`
and automatically uploads to CodeCov with our CI setup.

## CI-CD: Github Actions

Handles our deployment and test running. We also integrate
with CodeCov for the coverage reports.

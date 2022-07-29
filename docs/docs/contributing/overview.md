# Contributing Overview

So, you're interested in contributing to Tachi? Awesome! All help is appreciated.
But, what *can* you contribute, and where can you help out?

## What does Tachi need?

Contrary to what you might already think, contributing to Tachi actually has remarkably little to
do with code.

The primary Tachi maintainer (hitherto referred to as `zkldi`, because that's their name)
deals with the core of the codebase; things like importing scores, adding new features and most of the UI work
is handled by them.

Tachi actually doesn't really have a shortage of people who can write good code, and the core of the codebase
feature-wise is maintainable entirely by `zkldi` comfortably.

What **isn't** possible to maintain, is the sheer amount of things going on in every game! `zkldi`
cannot reasonably keep track of all the games we support and everything that's going on in them.

That's where you step in - people who actually actively *play* games on Tachi! By letting `zkldi`
know about things going on in your game - and even contributing things yourself - you help make their life easier
and Tachi's support for your favourite game even better!

## What can I contribute to?

Now for the fun part. In order of difficulty, here are the components of Tachi you can reasonably
contribute to!

All of these sections summarise a part of Tachi, and end with a link to a guide you can use to
contribute to it.

!!! important
	All of the guides linked are understandable by **complete** beginners. Don't worry if you don't
	know the first thing about what a "Pull Request" is.
	
	Hell, `zkldi` didn't know what one of those was until mid-2020.

	We all have to start somewhere, and our guides are designed for everyone.

### Issue Reports

You can report issues on the [GitHub](https://github.com/TNG-Dev/Tachi) repository. This requires
*absolutely no programming knowledge* on your part. All you have to do is write up a nice summary
of the bug.

!!! note
	Although they're called GitHub *issues*, they're actually used for tracking anything. If you've
	came up with a cool feature idea, send it over as an issue! `zkldi` will read and Triage them.

For more information, read our [Issue Reporting Guide](./issues.md).

### Documentation

We store our documentation as a series of markdown files in the [Main Repository](https://github.com/TNG-Dev/Tachi).

Writing, maintaining and proofreading the documentation is something that is **severely** neglected
at the moment. Simple things like typo fixes, all the way up to writing new explanations about major features
are **thoroughly** appreciated, as `zkldi` prioritises maintaining the core of working code.

If you're interested in this, check out the [Documentation Contribution Guide](./docs.md).

It'll teach you `shell` and `git` basics,
setting up a programming environment for Tachi,
and how to use our documentation builder.

### Database Seeds

We use an interesting system for parts of our database. We actually store a game's songs and charts *in*
our GitHub repository! That means you can:

- Open the `songs` file for a game.
- Edit a `title` of a song that has a typo.
- Add a couple new songs that were added in the latest update
- Submit your changes back and if they're accepted...
- They automatically synchronise with the site!

!!! important
	This part of Tachi is the most important part for external contributors.
	You guys know these games better than `zkldi` does, and you guys keep an eye on all the updates for your games!

	If people don't add songs/charts to this database, `zkldi` will **not** keep an eye on the game for you! Someone *has* to pick up the reigns for each game!

	If you want to add/fix songs, charts, folders or tables for your favourite game - **START HERE!**

	Or in general, if you just want to contribute and don't know what to -- **this is the MOST in need of help. Always.**

Want to get started on contributing to the Database? Check out our [Database Contribution Guide](./database.md).

It'll teach you `shell` and `git` basics,
setting up a programming environment for Tachi,
`json`,
and we'll even do a little scripting as a treat!

### Server, Client

The server and client form the powerful *core* of Tachi.

The server handles all of our logic -- How do we get scores, where should scores come from, how do we calculate all these stats and way more.

The client tries to then place a slick UI over that logic and its exposed API.

!!! warning
	Tachi's core is not an amazingly complex beast, but it is *not* going to be reasonably followable
	with 0 programming experience. You'll need some background in programming to be able to do much in
	this section.

	That said, we still have a thorough guide -- It's not *from 0*, but it is *from some programming knowledge*.

Want to get started on contributing to the Core? Check out our [Core Contribution Guide](./core.md).

We'll cover...

- Running a local development instance of Tachi.
- How to configure the server with `conf.json5`.
- How our codebase is laid out.
- How to run tests and more!

## That's it for now!

Everything else in Tachi isn't seeking external contribution at the moment. So, feel free to check
out one of the above linked guides!
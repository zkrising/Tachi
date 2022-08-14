# Tachi Documentation

This site serves as the documentation for Tachi.

Tachi is a fully-open rhythm game score tracking engine, and is the name of the codebase that powers
both [Bokutachi](https://bokutachi.xyz) and [Kamaitachi](https://kamaitachi.xyz).

!!! help
	Tachi is **fully open**. The core is almost exclusively maintained by [one person](https://github.com/zkldi).
	However, we support nearly twenty games and playtypes now. Said one person cannot reasonably keep up
	with all the new things coming out in those games.

	If you care about a game you play a lot, and want to help out Tachi, there are loads of ways you can contribute
	and ease the load on the primary maintainer!
	
	Because Tachi is fully open source, if you want a feature, bug-fix, or new content added to your game,
	you can *become a contributor* or *report to someone who will contribute!*

	We maintain a **comprehensive** [contribution guide](./contributing), which is accessible
	to even people who have never wrote a line of code in their life. If you want to improve Tachi, and maybe even
	nab some development skills yourself (or look good on a CV!), check it out. I've put a lot of effort into it.

## About This Documentation

This is the documentation for *all* of Tachi. It - like Tachi - is primarily maintained by one
person, and as such, some things may be slightly outdated, wrong, or generally just ill-maintained.

!!! info
	If you're confused about anything, ask in the `#dev` channel of your Tachi instance's discord!
	We have a remarkably helpful community of developers and contributors, who should be able to help you out.

Apologies in advance! If you find a problem in the documentation, you can freely contribute a fix
to it. See the [Contribution Guide](./contributing)!

*****

## Programmer References

These sections are for experienced programmers who want to see documentation on how
Tachi's components work internally and externally.

If you're looking to contribute to Tachi, check out the [Contribution Guide](./contributing).

### API Reference

This is for people who want to make things with Tachi's API, and assumes basic knowledge of
APIs and how they work.

View it [here](./api).

### Server Codebase Reference

This is for people who want to work on `Tachi-Server`'s codebase.
This contains things like the tools we use and the
infrastructure that powers Tachi.

View it [here](./tachi-server).

### Bot Codebase Reference

This is for people who want to work on the `Tachi-Bot`.
This codebase is maintained by [pfych](https://github.com/pfych), and is wrote in TypeScript.

View it [here](./tachi-bot).

### Wiki

This is for end user reference, such as score importing tutorials, documentation on tachi's
statistics. It requires no programming knowledge, and is mostly used as a wiki-like reference.

View it [here](./user).

## Acknowledgements

This documentation is built ontop of the beautiful [Material MKDocs](https://squidfunk.github.io/mkdocs-material) theme.

--8<-- "includes/abbreviations.md"
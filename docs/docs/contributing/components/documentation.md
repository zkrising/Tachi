# Documentation Guide

The documentation component of Tachi powers the website you're currently viewing. Hi!

## Tool Knowledge

To properly contribute to the documentation, you'll need to know the following things:

- [The Terminal](../tools/terminal.md)
- [Git](../tools/git.md)

If you don't know, or aren't comfortable with all of the things on this list, click on them to learn about them!

## Software Overview

We use [MKDocs Material](https://squidfunk.github.io/mkdocs-material/) for our documentation.
It extends markdown a bit to let us add things like admonitions and references.

This is a Python package, making it the only part of our codebase that is Python based. As such, you'll need a way of installing python packages.

Their documentation is **incredibly** good, so check their stuff out there if you want to use their markdown extensions.

Other than that, our documentation is vanilla [markdown](https://www.markdownguide.org/basic-syntax/). If you know how to write a reddit comment, you know how to write documentation.

## Dependencies

Use `pip` to install `mkdocs` and `mkdocs-material`.

!!! danger
	[Python package management is an utter disasterous mess](https://stackoverflow.com/questions/48941116/does-python-pip-have-the-equivalent-of-nodes-package-json). Feel free to set up a venv or some other elaborate rube-goldberg machine to ensure that your packages don't bleed everywhere.
	
	Either way, you want to install such that is `mkdocs` on your terminal.

	You might have to restart your terminal after installing it, depending on the alignment of `pip` with the sun.

## Running the Documentation

Use `mkdocs serve` inside Tachi's `docs/` folder to start up a local documentation viewer on port `8000`.

This will automatically refresh when you edit anything related to the documentation, so you can quickly see how your stuff goes.

## A bit about mkdocs.yml

MKDocs has only one configuration file -- `mkdocs.yml`. This is a [YAML](https://en.wikipedia.org/wiki/YAML) file that configures the documentation we output.

It also manages the order of pages on the site. **You need to edit this if you're adding new pages! They aren't automatically added!**

## Contributing Back

It's just documentation. Make the changes and commit them up, ideally with `docs:` as the commit prefix.

That is to say: your commit messages should look like `docs: fixed typo in API route`.
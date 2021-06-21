# Contributing To Tachi

If you want to contribute to Tachi, that's really appreciated!

Most of the time, Tachi is a one-man operation, so
any help is really appreciated.

*****

## For Newcomers

If you're looking to contribute to Tachi but aren't
really familiar with TypeScript or other things
we use, Documentation Contributions are highly
appreciated, and accessible to do without any
programming knowledge.

If you're not familiar with git, I would recommend
downloading [GitHub Desktop](https://desktop.github.com/).

It has a nice, intuitive UI for making changes, and
saves the trouble of having to explain how forks work.

## Documentation Contributions

The documentation for Tachi may have typos, slight mistakes
or inconsistencies. Fixes for those are always appreciated.

Larger documentation contributions (such as documenting
logic in the codebase) may be subject to some more scrutiny
to make sure that they are correct, but are also significantly appreciated.

To contribute to the documentation, you should go to
the [GitHub](https://github.com/zkldi/tachi-docs), and
fork the repository.

## Non-Code Contributions

Inside the Discord Servers for Bokutachi and Kamaitachi is
a `#help-wanted` channel. This channel lists things that I
currently cannot do, either for time or knowledge reasons.

These are not code related contributions, and can range from
cool images of cabinets/setups to milestones for a game.

These are also significantly appreciated.

## Codebase Contributions

`tachi-server` is the core of the logic behind tachi, and
is open sourced under AGPLv3.

Contributions to this will be under increased scrutiny as
I am trying to keep the codebase well organised and tidy.

!!! tip
	If you're setting up a development environment locally,
	commit `47c981f` converted the codebase from spaces to tabs.
	This revision is hidden using .git-blame-ignore-revs.

	You can fix it with this command.
	```
	git config blame.ignoreRevsFile .git-blame-ignore-revs  
	```

	!!! warning
		This only works on git 2.23 or greater. Your package manager may not have a version
		this recent. See [Git Installation for Linux](https://git-scm.com/download/linux).

### Pull Requests

You can contribute to `tachi-server` by going to the
[GitHub](https://github.com/zkldi/tachi-server), forking,
and then making your changes.

There are a couple of strict guidelines to follow when
writing code contributions (Pull Requests). Not following these may
result in your pull request being rejected.

- Write tests.

Your new code should be tested. You can read how and where
tests work in [Testing](./infrastructure/testing).

- Follow the style guide.

Your new code should follow the style of the repo. The linter
should not have any errors. Generally, write code that
looks like it belongs.

- Follow the branching rules.

Your code should follow the branching setup we have.
You can read about it [here](./infrastructure/branches)

- Your PR should fix an issue.

If there isn't an issue for your PR, you should make one
before making the PR.

For larger PRs, such as making new features/new support,
you should make the issue in advance so discussion can
occur (so you don't waste your time on code that can't
be merged).

### Issues

Submitting issues to `tachi-server` is encouraged. Despite
the GitHub name of 'issues', issues may also be feature
requests, new support requests, and similar things.

Guidelines for submitting issues are as follows:

- Be Nice.

Self-explanatory. Remember the human!

- Make sure your issue isn't already reported as a duplicate.

This saves me a lot of time. If there's a similar issue
but you think yours is different enough to warrant a new
issue, then that's fine.

- If this is a bug report, be as specific as possible.

Something like "It wont work" does not help at all.
Non-Specific bug reports will be closed immediately and marked as invalid.

- Documentation issues go in the other repo.

Documentation issues should go [here](https://github.com/zkldi/tachi-docs) instead.

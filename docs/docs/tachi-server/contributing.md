# Contributing To Tachi Server

If you want to contribute to Tachi, that's really appreciated!

Most of the time, Tachi is a one-man operation, so
any help is really appreciated.

*****

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

!!! warn
	Your code should follow the branching setup we have.
	You can read about it [here](./infrastructure/branches).
# Branching Model

`Tachi` maintains two long-running branches, and uses a remarkably simple model for merging.

*****

## Branches

### `release/v2.x`

This is the current release version of `Tachi`, and is automatically deployed into production.

!!! note
	Our CI automatically selects the largest value of `x` to use as the production
	branch.

### `staging`

This is the development branch, and is where pull requests
are merged to. This will be automatically deployed to the Tachi staging servers
for further testing.

## How should I PR?

You should submit your PRs for `staging`. If this change should be backported into production, note that in your PR.

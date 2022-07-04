# Branching Model

`tachi-server` has a very specific branching model.

Breaking the rules in this branching model will result
in your Pull Request being rejected.

*****

## Acknowledgements

This branching model is identical to [A Successful Git Branching Model](https://nvie.com/posts/a-successful-git-branching-model/).

You can read that post instead of this one, if you prefer,
but I will provide a simplified explaination below.

## Static Branches

These branches are always present, and never to be deleted.

### `master`

This is the current release version of `tachi-server`, and
is deployed onto production.

This should never be committed to directly from anything other than `release-` branches.

Every commit to master is a new release.

### `develop`

This is the development branch, and is where pull requests
are merged to. You should merge `issue-` branches with `develop`.

## Ephemeral Branches

These branches are intended to be created, merged, and then
deleted.

### Feature Branches (`issue-`)

These branches **may** start with the text `issue-`, and are
followed by the issue number they reference.

You may call these branches whatever you want,
except things like `master` or `develop` or `hotfix-` etc.

Our convention is to use `issue-<issuenumber>`

These are forked from `develop`, and should be merged
with `develop`.

!!! note
	Despite the name `issue-`, these branches aren't
	bug fixes. They are anything that fix an Issue
	on the repository.

	This means these are also feature branches, and other
	things.

### `hotfix-`

These branches start with the text `hotfix-` and are followed by the issue number they fix.

These are forked from `master`, and should be merged with
both `master` and `develop`.

### `release-`

These branches start with the text `release-` and are
followed by the Major.Minor version of the release.

These are typically the final draft for a new release.

These are created when all the features we want in the
new release are present in develop, and we want to
get it ready for production.

These are forked from `develop`, and should be merged with
`master`.

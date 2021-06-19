# Versioning

*****

## Semver

`tachi-server` and `tachi-client` follow [Semantic Versioning](https://semver.org).

The two repositories have completely separate versioning, but generally will move in
lockstep with one-another.

!!! example
	For quick reference, MAJOR, MINOR and PATCH correspond as follows:

	```2.3.1 -> MAJOR.MINOR.PATCH```

## `master` Branch

Every push to `master` must involve a change to the versioning of that repository. If
it's a hotfix, it should bump the PATCH version. If it's a feature, it should update the
MINOR version.

The MAJOR version will only be bumped if there are significant changes to almost everything,
which I don't anticipate.

## Version Names

`tachi-server` and `tachi-client` have version names that change in correspondence with
their `MINOR` versions.

The version names follow the song titles of an album. In `tachi-server`'s case, it follows
[Portishead - Dummy](https://en.wikipedia.org/wiki/Dummy_(album))

For `tachi-client`, we follow [The Cure - Disintegration](https://en.wikipedia.org/wiki/Disintegration_(The_Cure_album))

### Why?

Versions following album songs saves the hassle of having to come up with nice sounding version
names. It's also an excuse to show off albums I really like.

As for why these specific albums:

Portishead's Dummy was chosen because Tachi V1 followed
[Massive Attack - Mezzanine](https://en.wikipedia.org/wiki/Mezzanine_(album)). The two albums
are both standout albums in the same genre, so it was fitting to follow it up.

The Cure's Disintegration was chosen because I wanted another album with
the same amount of tracks as Dummy, and it's also a great album.

!!! tip
	These albums are great. Do yourself a favour and check them out.

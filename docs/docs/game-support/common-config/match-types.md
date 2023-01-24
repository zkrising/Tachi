# Match Types

For [BATCH MANUAL](./todo) imports, we need a way of resolving given identifiers
into charts on Tachi. These may be through a variety of methods, such as chart hashes,
in game IDs, etc.

This is a list of **all** available match types. However, what match types are available
depend on what game you're importing scores for.

## Identifier Only

The following match types only need an `identifier` defined.

### `bmsChartHash`

Uses `identifier` as an MD5 or SHA25 hash.

### `itgChartHash`

Uses `identifier` as a GroovestatsV3 hash.

### `popnChartHash`

Uses `identifier` as a SHA256 hash, for pop'n file contents.

### `uscChartHash`

Uses `identifier` as a SHA1 hash, since that's what USC uses.

## Identifier + Difficulty

These match types need both `identifier` and a `difficulty` defined.

### `inGameID`

Looks up on the in game ID for this chart.

### `sdvxInGameID`

Looks up on the in game ID for this chart, but allows a special difficulty string - `"ANY_INF"` to be passed.

If `"ANY_INF"` is the difficulty, then that difficulty will try to find a chart with this in game ID where the difficulty is any of INF, GRV, HVN, VVD or XCD.

### `songTitle`

Looks up the song on its title or any of its defined `altTitles`.

!!! warning
	This *requires* that your game never has two songs with the same title. By enabling
	this, the seeds tests will check and enforce this for you.

	You should generally *never* enable this option, as you *really* can't guarantee
	the uniqueness of song titles short of the game being dead.

### `tachiSongID`

Looks up the song on Tachi's defined `songID`.

## Adding a new Match Type

Does your GPT implementation need its own match type? See [Adding a new match type](./COOKBOOK TODO).
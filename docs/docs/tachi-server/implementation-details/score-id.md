# Score ID implementation

Score IDs exist to dedupe scores when a user re-submits
the same scores. This happens frequently with `file/`
and `api/` [Import Types](../import/import-types.md),
as they typically resubmit the same scores.

If a user only got a score once, we don't want to store
it twice.

*****

## Hashing

The score ID is created by hashing the following template string:

```ts
`${userID}|${chartID}|${dryScore.scoreData.lamp}|${dryScore.scoreData.grade}|${dryScore.scoreData.score}|${dryScore.scoreData.percent}`
```

with SHA256.

This is then prefixed with `R`, and returned.

## Why those fields?

Games do a lot of wacky things. We'd rather not discard
non-duplicates, so we're a little more strict than we
maybe should be.

UserID and chartID are so we don't accidentally collide
with other user's scores or charts.

Score and Lamp make sense - since if those change we no
longer really have the same score.

Grade and Percent are the slightly more strict ones. Some
games have very strange external grade requirements, such
as osu!standard enforcing a Full Combo for an S rank.

Percent may not correlate with score. This was in anticipation
to support BMS's `#RANDOM` instruction - where charts may
have a dynamic amount of notes - but I've decided it
wasn't worth it. Still, this is left in for futureproofing.

!!! warning
	An open issue exists to refactor how score IDs work.

	It would make significantly more sense for every game to get its own scoreID algorithm,
	since not all games have the same significant properties.

	This would also let us support things like SDVX6's EX Score.
# Sessions

This page documents how Sessions are constructed.
For a humanised explaination of sessions, see
TODO.

*****

## Creating New Sessions

Scores are sorted on the time they were achieved. Scores
without timestamps are discarded from any session processing.

Scores are then grouped into buckets of two hours, in pseudocode:

```ts
let lastTimestamp = 0;

for (score of scores) {
	if (score.timestamp > lastTimestamp + TWO_HOURS) {
		CloseBucket();
		CreateNewBucketWithThisScore();
	}
	else {
		AppendToBucket();
	}

	lastTimestamp = score.timestamp;
}
```

This means that if there was more than two hours between
any two successive scores, the session is marked as terminated
and a new bucket of scores is created.

For every bucket of scores we have, we iterate over the
scores inside the bucket, and compare them against the
users' current PB. Since PBs are updated *after* sessions
are processed, this means we are processing them against
their past PBs.

!!! bug
	If a user ends up making sessions in the past,
	this step will compare against their current PBs -
	instead of the PBs they would've had at the time
	of that session.

Once we have compared all the scores against the PBs, we
can create a session from it. We need to generate a random
name (we have some stuff in `src/datasets` for this).

We also need to calculate statistics for this session,
this is dependent on the game + playtype being used.

## Appending To Sessions

If a score within 2 hours of an existing session,
then that score is appended to the session.

!!! bug
	Sessions do not currently conjoin if a user was to
	get a score between two sessions such that
	there was now less than two hours between the first
	sessions last score and the second sessions first score.

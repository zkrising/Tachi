# Updating Milestones

We update milestones by looking at the set of modified
goalIDs, and check the user's assigned milestones to
get those that are affected.

*****

## Returns

We evaluate every milestone, and for each one,
create a bulkwrite operation to update the user's milestone
progress.

If the user has newly achieved a milestone, a Redis Event
is emitted, which could be hooked into by our Discord Bot.

If the progress has changed at all, the data is
pushed to an array which is then returned. This is
attached onto the Import Document.
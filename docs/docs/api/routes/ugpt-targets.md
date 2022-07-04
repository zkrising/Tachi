# UGPT-Target Endpoints

These endpoints deal with [targets](../../api/terminology.md) for a User, Game and Playtype. These are things like subscribing to a new milestone, or reading info about progress on a specific goal.

For user-specific target endpoints, such as subscriptions, see [UGPT-Target Endpoints](./ugpt-targets.md).

*****

*****

## Retrieve a user's recently achieved targets.

`GET /api/v1/users/:userID/games/:game/:playtype/targets/recently-achieved`

### Parameters

None.

### Response

| Property | Type | Description |
| :: | :: | :: |
| `goalSubs` | Array&lt;GoalSubDocument&gt; | The goal subscriptions that were recently achieved by this user. |
| `goals` | Array&lt;GoalDocument&gt; | The goal documents that were recently achieved (if any). |
| `milestoneSubs` | Array&lt;MilestoneSubDocument&gt; | The milestone subscriptions that were recently achieved by this user. |
| `milestone` | Array&lt;MilestoneDocument&gt; | The milestone documents that were recently achieved (if any). |
| `user` | UserDocument | The user you requested this information about. |

*****

## Retrieve a user's recently raised targets.

`GET /api/v1/users/:userID/games/:game/:playtype/targets/recently-raised`

!!! info
	Recently raised means that the user recently increased their `progress` on the target. It explicitly excludes achieved goals -- only things that they are getting closer to.

### Parameters

None.

### Response

| Property | Type | Description |
| :: | :: | :: |
| `goalSubs` | Array&lt;GoalSubDocument&gt; | The goal subscriptions that were recently achieved by this user. |
| `goals` | Array&lt;GoalDocument&gt; | The goal documents that were recently achieved (if any). |
| `milestoneSubs` | Array&lt;MilestoneSubDocument&gt; | The milestone subscriptions that were recently achieved by this user. |
| `milestone` | Array&lt;MilestoneDocument&gt; | The milestone documents that were recently achieved (if any). |
| `user` | UserDocument | The user you requested this information about. |

*****

## Retrieve this user's milestone subscriptions.

`GET /api/v1/users/:userID/games/:game/:playtype/targets/milestones`

### Parameters

None.

### Response

| Property | Type | Description |
| :: | :: | :: |
| `milestones` | Array&lt;MilestoneDocument&gt; | All of the milestones this user is subscribed to. |
| `milestoneSubs` | Array&lt;MilestoneSubDocument&gt; | All of this user's milestone subscriptions. |

*****

## Get a user's progress on a specific milestone they are subscribed to.

`GET /api/v1/users/:userID/games/:game/:playtype/targets/milestones/:milestoneID`

!!! info
	If you're looking to evaluate a milestone against a user, without knowing whether they're
	subscribed to it or not, you want [GPT/Targets/Milestones/Evaluate-For](gpt-targets.md#evaluate-a-milestone-for-a-user-even-if-they-arent-subscribed-to-it).

	This endpoint is admittedly in a very strange position, where it overlaps with that `evaluate-for` endpoint quite significantly, but this endpoint is also intended to return the user's `milestoneSub`, so I thought it best to split this into two endpoints.

### Parameters

None.

### Response

| Property | Type | Description |
| :: | :: | :: |
| `milestoneSub` | MilestoneSubDocument | The user's subscription to this milestone. |
| `milestone` | MilestoneDocument | The milestone document in question. |
| `goals` | Array&lt;GoalDocument&gt; | The goals involved in this milestone. |
| `results` | Array&lt;EvaluatedGoalResult&gt; | The user's progress on each goal in this milestone. |

#### EvaluatedGoalResult

| Property | Type | Description |
| :: | :: | :: |
| `goalID` | String | The goal ID that these results are for. |
| `achieved` | Boolean | Whether this goal was achieved or not. |
| `progress` | Number \| Null | How much progress this user made on this goal. Null if no progress was made. |
| `outOf` | Number | What `progress` needs to be greater than or equal to for this goal to count as achieved. |
| `progressHuman` | String | A humanised, pretty-printed progress indicator for this goal. |
| `outOfHuman` | String | A humanised, pretty-printed outOf indicator for this goal. |

*****

## Subscribe to a milestone.

`PUT /api/v1/users/:userID/games/:game/:playtype/targets/milestones/:milestoneID`

### Permissions

- `manage_targets`
- Must be the requesting user.

### Parameters

None. (All relevant info is in the URL.)

### Response

| Property | Type | Description |
| :: | :: | :: |
| `goals` | Array&lt;GpalDocument&gt; | The goals involved in this milestone. |
| `milestone` | MilestoneDocument | The milestone the user just subscribed to. |
| `goalResults` | Array&lt;EvaluatedGoalResults&gt; | The user's progress on each individual goal in this milestone. |
| `milestoneSub` | MilestoneSubscriptionDocument | The milestone subscription this user just created |

*****

## Unsubscribe from a milestone.

`DELETE /api/v1/users/:userID/games/:game/:playtype/targets/milestones/:milestoneID`

### Permissions

- `manage_targets`
- Must be the requesting user.

### Parameters

None.

### Response

| Property | Type | Description |
| :: | :: | :: |
| `milestone` | MilestoneDocument | The milestone you just unsubscribed from. |

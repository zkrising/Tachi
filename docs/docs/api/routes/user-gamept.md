# Individual User on Specific Game

This endpoints are for specific users information on specific game + playtype combinations.

*****

## Get information about a user's plays on a game + playtype.

`GET /api/v1/users/:userID/games/:game/:playtype`

### Parameters

| Property | Type | Description |
| :: | :: | :: |
| `:userID` | URL Parameter | The ID or username of the user to retrieve information from. |
| `:game` | URL Parameter | The game to retrieve information from. Must be a supported game. |
| `:playtype` | URL Parameter | The playtype to retrieve information for. Must be a supported playtype of the previous game. |

### Response

| Property | Type | Description |
| :: | :: | :: |
| `gameStats` | UserGameStatsDocument | The User's GameStats for this game + playtype. |
| `firstScore` | ScoreDocument or Null | The user's first score for this game + playtype. This is null if the user has no scores with timestamps. |
| `mostRecentScore` | ScoreDocument or Null | The user's most recent score. This is null if the user has no scores with timestamps. |
| `totalScores` | integer | The total amount of scores this user has. |
| `rankingData` | { ranking: integer, outOf: integer } | The position of this player on the default leaderboards for this game, and how many players it is out of. |

### Example

#### Request
```
GET /api/v1/users/zkldi/games/iidx/SP
```

#### Response

```js
{
	gameStats: {
		userID: 1,
		game: "iidx",
		playtype: "SP",
		ratings: {
			ktRating: 15
		},
		classes: {
			dan: 14
		}
	},
	firstScore: null,
	mostRecentScore: null,
	totalScores: 5,
	rankingData: {
		ranking: 3,
		outOf: 18
	}
}
```

*****

## Retrieve a user's goals for this game + playtype.

`GET /api/v1/users/:userID/games/:game/:playtype/goals`

### Parameters

| Property | Type | Description |
| :: | :: | :: |
| `:userID` | URL Parameter | The ID or username of the user to retrieve information from. |
| `:game` | URL Parameter | The game to retrieve information from. Must be a supported game. |
| `:playtype` | URL Parameter | The playtype to retrieve information for. Must be a supported playtype of the previous game. |
| `unachieved` (Optional) | Presence | If present, only unachieved goals are returned. |

### Response

| Property | Type | Description |
| :: | :: | :: |
| `userGoals` | Array&lt;UserGoalDocument&gt; | The array of user-subscriptions to goals this user has. |
| `goals` | Array&lt;GoalDocument&gt; | The array of goal documents this user has a subscription to. |

### Example

#### Request
```
GET /api/v1/users/zkldi/games/iidx/SP/goals
```

#### Response

```js
{
	userGoals: [
		{
			userID: 1,
			goalID: "foobar",
			progress: 4,
			progressHuman: "CLEAR",
			outOf: 5,
			outOfHuman: "HARD CLEAR",
			// ... so on
		}
	],
	goals: [
		{
			goalID: "foobar",
			title: "Hard Clear 5.1.1. SP ANOTHER",
			// ... so on
		}
	]
}
```

*****

## Retrieve a user's milestones for this game + playtype.

`GET /api/v1/users/:userID/games/:game/:playtype/milestones`

### Parameters

| Property | Type | Description |
| :: | :: | :: |
| `:userID` | URL Parameter | The ID or username of the user to retrieve information from. |
| `:game` | URL Parameter | The game to retrieve information from. Must be a supported game. |
| `:playtype` | URL Parameter | The playtype to retrieve information for. Must be a supported playtype of the previous game. |
| `unachieved` (Optional) | Presence | If present, only unachieved milestones are returned. |

### Response

| Property | Type | Description |
| :: | :: | :: |
| `userMilestones` | Array&lt;UserMilestoneDocument&gt; | The array of user-subscriptions to milestones this user has. |
| `milestones` | Array&lt;MilestoneDocument&gt; | The array of milestone documents this user has a subscription to. |

### Example

#### Request
```
GET /api/v1/users/zkldi/games/iidx/SP/milestones
```

#### Response

```js
{
	userMilestones: [
		{
			userID: 1,
			milestoneID: "foobar",
			// ... so on
		}
	],
	milestones: [
		{
			milestoneID: "foobar",
			title: "IIDX SP 9th Dan Milestone",
			// ... so on
		}
	]
}
```

*****

## Search a user's personal bests.

`GET /api/v1/users/:userID/games/:game/:playtype/pbs`

### Parameters

| Property | Type | Description |
| :: | :: | :: |
| `:userID` | URL Parameter | The ID or username of the user to retrieve information from. |
| `:game` | URL Parameter | The game to retrieve information from. Must be a supported game. |
| `:playtype` | URL Parameter | The playtype to retrieve information for. Must be a supported playtype of the previous game. |
| `search` | String | Limits the returned scores to those where the corresponding song is most similar to this query. |

### Response

| Property | Type | Description |
| :: | :: | :: |
| `songs` | Array&lt;SongDocument&gt; | The array of songs this search returned. |
| `charts` | Array&lt;ChartDocument&gt; | The array of charts this search returned. |
| `pbs` | Array&lt;PBDocument&gt; | The array of personal bests this search returned. This is limited to 30 returns. |

### Example

#### Request
```
GET /api/v1/users/zkldi/games/iidx/SP/pbs?search=Verfl
```

#### Response

```js
{
	pbs: [{
		userID: 1,
		scoreData: {
			score: 123,
			// ...
		}
	}],
	songs: [{
		title: "Verflucht",
		// ...
	}],
	charts: [{
		songID: 123,
		playtype: "SP",
		difficulty: "ANOTHER",
		// ...
	}, {
		songID: 123,
		playtype: "SP",
		difficulty: "HYPER",
	}]
}
```

## Get a user's best 100 personal bests.

`GET /api/v1/users/:userID/games/:game/:playtype/pbs/best`

This returns the users' best 100 personal bests according
to the [Default Rating Algorithm](../../codebase/implementation-details/game-configuration) for this game.

This is returned in descending sorted order.

The query parameter `alg` can be used to specify a
different rating algorithm to sort under.

### Parameters

| Property | Type | Description |
| :: | :: | :: |
| `:userID` | URL Parameter | The ID or username of the user to retrieve information from. |
| `:game` | URL Parameter | The game to retrieve information from. Must be a supported game. |
| `:playtype` | URL Parameter | The playtype to retrieve information for. Must be a supported playtype of the previous game. |
| `alg` | String | An overriding rating algorithm to use instead of the default. |

### Response

| Property | Type | Description |
| :: | :: | :: |
| `songs` | Array&lt;SongDocument&gt; | The array of songs this search returned. |
| `charts` | Array&lt;ChartDocument&gt; | The array of charts this search returned. |
| `pbs` | Array&lt;PBDocument&gt; | The array of personal bests this search returned. |

### Example

#### Request
```
GET /api/v1/users/zkldi/games/iidx/SP/pbs/best?alg=BPI
```

#### Response

```js
{
	pbs: [{
		userID: 1,
		scoreData: {
			// ...
		},
		calculatedData: {
			ktRating: 15,
			BPI: 4.4
		}
	}, {
		userID: 1,
		scoreData: {
			// ...
		},
		calculatedData: {
			ktRating: 19,
			BPI: 4.2
		}
	}],
	songs: [{
		title: "Verflucht",
		// ...
	}, {
		title: "AA",
		// ...
	}],
	charts: [{
		songID: 123,
		playtype: "SP",
		difficulty: "ANOTHER",
		// ...
	}, {
		songID: 14,
		playtype: "SP",
		difficulty: "ANOTHER",
	}]
}
```

*****

## Search a user's individual scores.

`GET /api/v1/users/:userID/games/:game/:playtype/scores`

### Parameters

| Property | Type | Description |
| :: | :: | :: |
| `:userID` | URL Parameter | The ID or username of the user to retrieve information from. |
| `:game` | URL Parameter | The game to retrieve information from. Must be a supported game. |
| `:playtype` | URL Parameter | The playtype to retrieve information for. Must be a supported playtype of the previous game. |
| `search` | String | Limits the returned scores to those where the corresponding song is most similar to this query. |

### Response

| Property | Type | Description |
| :: | :: | :: |
| `songs` | Array&lt;SongDocument with __textScore&gt; | The array of songs this search returned. |
| `charts` | Array&lt;ChartDocument&gt; | The array of charts this search returned. |
| `scores` | Array&lt;ScoreDocument&gt; | The array of scores this search returned. This is limited to 30 returns. |

!!! info
	All `songs` returned also have the `__textScore`
	property. This property describes how close the query
	was to the actual text, and is mostly internal.

	You can read more into the details of this at [Search Implementation](../../codebase/implementation-details/search.md)

### Example

#### Request
```
GET /api/v1/users/zkldi/games/iidx/SP/scores?search=Verfl
```

#### Response

```js
{
	scores: [{
		userID: 1,
		scoreData: {
			score: 123,
			// ...
		}
	}],
	songs: [{
		title: "Verflucht",
		// ...
	}],
	charts: [{
		songID: 123,
		playtype: "SP",
		difficulty: "ANOTHER",
		// ...
	}, {
		songID: 123,
		playtype: "SP",
		difficulty: "HYPER",
	}]
}
```

*****

## Get a user's most recent 100 scores.

`GET /api/v1/users/:userID/games/:game/:playtype/scores/recent`

### Parameters

| Property | Type | Description |
| :: | :: | :: |
| `:userID` | URL Parameter | The ID or username of the user to retrieve information from. |
| `:game` | URL Parameter | The game to retrieve information from. Must be a supported game. |
| `:playtype` | URL Parameter | The playtype to retrieve information for. Must be a supported playtype of the previous game. |

### Response

| Property | Type | Description |
| :: | :: | :: |
| `songs` | Array&lt;SongDocument&gt; | The array of songs this search returned. |
| `charts` | Array&lt;ChartDocument&gt; | The array of charts this search returned. |
| `scores` | Array&lt;ScoreDocument&gt; | The array of scores this search returned. This is limited to 30 returns. |

### Example

#### Request
```
GET /api/v1/users/zkldi/games/iidx/SP/scores/recent
```

#### Response

```js
{
	scores: [{
		userID: 1,
		scoreData: {
			score: 123,
			// ...
		}
	}],
	songs: [{
		title: "Verflucht",
		// ...
	}],
	charts: [{
		songID: 123,
		playtype: "SP",
		difficulty: "ANOTHER",
		// ...
	}, {
		songID: 123,
		playtype: "SP",
		difficulty: "HYPER",
	}]
}
```

*****

## Search a user's sessions.

`GET /api/v1/users/:userID/games/:game/:playtype/sessions`

Searches the names of sessions from a given user. This
does not search session descriptions, nor does it search
song titles of played songs inside sessions.

### Parameters

| Property | Type | Description |
| :: | :: | :: |
| `:userID` | URL Parameter | The ID or username of the user to retrieve information from. |
| `:game` | URL Parameter | The game to retrieve information from. Must be a supported game. |
| `:playtype` | URL Parameter | The playtype to retrieve information for. Must be a supported playtype of the previous game. |
| `search` | string | The session name to search for. |

### Response

| Property | Type | Description |
| :: | :: | :: |
| `<body>` | Array&lt;SessionDocument&gt; | The array of sessions that matched this query. |

### Example

#### Request
```
GET /api/v1/users/zkldi/games/iidx/SP/sessions?search=epic%20session
```

#### Response

```js
[
	{
		name: "My Epic Session!!!",
		userID: 1,
		game: "iidx",
		playtype: "SP",
		// ...
	}
]
```

## Get a user's best 100 sessions.

`GET /api/v1/users/:userID/games/:game/:playtype/sessions/best`

Retrieves a user's best 100 sessions according to the
game + playtypes default algorithm. The algorithm can
be overrode with the `alg` query string parameter.

These are returned in descending order.

### Parameters

| Property | Type | Description |
| :: | :: | :: |
| `:userID` | URL Parameter | The ID or username of the user to retrieve information from. |
| `:game` | URL Parameter | The game to retrieve information from. Must be a supported game. |
| `:playtype` | URL Parameter | The playtype to retrieve information for. Must be a supported playtype of the previous game. |
| `alg` (Optional) | string | The name of the algorithm to use instead of the default. |

### Response

| Property | Type | Description |
| :: | :: | :: |
| `<body>` | Array&lt;SessionDocument&gt; | The array of the users best sessions. |

### Example

#### Request
```
GET /api/v1/users/zkldi/games/iidx/SP/sessions/best
```

#### Response

!!! info
	The default rating algorithm for IIDX:SP is `ktRating`.

```js
[
	{
		userID: 1,
		game: "iidx",
		playtype: "SP",
		calculatedData: {
			ktRating: 14,
			bpi: 3
		}
		// ... more properties
	},
	{
		userID: 1,
		game: "iidx",
		playtype: "SP",
		calculatedData: {
			ktRating: 13.2,
			bpi: 4
		}
	}
]
```
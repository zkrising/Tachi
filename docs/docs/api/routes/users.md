# Users

These endpoints are related to users in general.

*****

## List Users

` /api/v1/users`

### Parameters

| Property | Type | Description |
| :: | :: | :: |
| `online` (Optional) | Presence | If present, this limits the returned users to those that are currently online. |
| `search` (Optional) | String | If present, this endpoint will only return users where this string is contained within their username. |

### Response

| Property | Type | Description |
| :: | :: | :: |
| `<body>` | Array&lt;UserDocument&gt; | The array of up to 100 users returned. |

### Example

#### Request

```
GET /api/v1/users
```

#### Response

```js
[{
	"id": 1,
	"username": "zkldi",
	// ... continued
}]
```

*****

## Retrieve user with ID

`GET /api/v1/users/:userID`

### Parameters

| Property | Type | Description |
| :: | :: | :: |
| `:userID` | URL Parameter | The user's userID or their username. |

### Response

| Property | Type | Description |
| :: | :: | :: |
| `<body>` | UserDocument | The user this ID/username corresponds to. |

### Example

!!! note
	`zkldi` is the username for the user with userID 1.

	it's also the username of the person writing these
	docs. Hi!

#### Request
```
GET /api/v1/users/zkldi
OR
GET /api/v1/users/1
```

#### Response

```js
{
	id: 1,
	username: "zkldi",
	// ... so on
}
```

*****

## Retrieve user's statistics on all games.

`GET /api/v1/users/:userID/game-stats`

### Parameters

| Property | Type | Description |
| :: | :: | :: |
| `:userID` | URL Parameter | The user ID or username to fetch the data of. |

### Response

| Property | Type | Description |
| :: | :: | :: |
| `<body>` | Array&lt;UserGameStatsDocument&gt; | The array of User Game Stats this user has. |

### Example

#### Request
```
GET /api/v1/users/zkldi/stats
OR
GET /api/v1/users/1/stats
```

#### Response

```js
[{
	userID: 1,
	game: "iidx",
	playtype: "SP",
	ratings: {
		ktRating: 15
	},
	classes: {
		dan: 14
	},
}, {
	userID: 1,
	game: "gitadora",
	playtype: "Dora",
	ratings: {
		skill: 1404
	},
	classes: {
		skillColour: 1
	}
}]
```

!!! info
	In the event a user has played no games, this will
	return an empty array.

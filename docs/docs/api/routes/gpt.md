# Game:Playtype Endpoints

These endpoints are for games + their playtypes.
To find out what games are supported by a service
programmatically, you should see [Game Endpoints](./games.md).

*****

## Retrieve Game:Playtype Configuration.

`GET /api/v1/games/:game/:playtype`

### Parameters

None.

### Response

| Property | Type | Description |
| :: | :: | :: |
| `config` | GamePTConfig | The configuration file for this game + playtype. |

!!! warning
	A GamePTConfig is different to a GameConfig! Read more
	[here](../../tachi-server/implementation-details/game-configuration.md).

### Example

#### Request
```
GET /api/v1/games/iidx/SP
```

#### Response

```json
{
	"config": {
		"idString": "iidx:SP",

		"percentMax": 100,

		"defaultScoreRatingAlg": "ktRating",
		"defaultSessionRatingAlg": "ktRating",
		"defaultProfileRatingAlg": "ktRating",

		// ... more props - a lot more props
	}
}
```

*****

## Retrieve the player leaderboard.

`GET /api/v1/leaderboard`

### Parameters

| Property | Type | Description |
| :: | :: | :: |
| `alg` (Optional) | String | If present, specifies an alternative algorithm to sort players on, instead of the default. |

### Response

| Property | Type | Description |
| :: | :: | :: |
| `gameStats` | GameStats[] | The sorted statistics for the leaderboards. |
| `users` | UserDocument[] | All of the related users for the above statistics. |

### Example

#### Request
```
GET /api/v1/games/iidx/SP/leaderboard
```

#### Response

```json
{
	"gameStats": [{
		"userID": 1,
		"ratings": {
			"ktRating": 4,
			// ...
		}
		// ...
	}],
	"users": [{
		"id": 1,
		"username": "zkldi"
	}]
}
```

*****

## Retrieve a song and its charts.

`GET /api/v1/games/:game/:playtype/songs/:songID`

### Parameters

None.

### Response

| Property | Type | Description |
| :: | :: | :: |
| `song` | SongDocument | The requested song document. |
| `charts` | ChartDocument[] | All of the charts that belong to this song for this playtype. |

### Example

#### Request
```
GET /api/v1/games/iidx/SP/songs/1
```

#### Response

```json
{
	"song": {
		"id": 1,
		"title": "5.1.1."
	},
	"charts": [{
		"songID": 1,
		"playtype": "SP",
		"difficulty": "HYPER",
		// ...
	}, {
		"songID": 1,
		"playtype": "SP",
		"difficulty": "ANOTHER",
		// ...
	}]
}
```

*****

## Get popular charts for this game + playtype.

`GET /api/v1/games/:game/:playtype/charts`

### Parameters

| Property | Type | Description |
| :: | :: | :: |
| `search` (Optional) | String | A song title to search for. |

!!! note
	If no search parameter is set, then the most popular
	100 charts for this game are returned.

	If a search parameter is set, then the most popular
	charts that match the search criteria will be returned,
	in that order.

### Response

| Property | Type | Description |
| :: | :: | :: |
| `charts` | Array&lt;ChartDocument with `__playcount`&gt; | The chart documents that matched this search, or the most popular 100 charts for this game. |
| `songs` | Array&lt;SongDocument&gt; | The associated song documents for the charts. |

!!! info
	The `__playcount` property is patched onto the chart
	documents returned. This indicates the amount of unique
	players that have played this chart.

### Example

#### Request
```
GET /api/v1/games/iidx/SP/charts?search=AA
```

#### Response

```json
{
	"songs": [{
		"title": "AA",
		"id": 3,
		// ...
	}, {
		"title": "AA -rebuild-",
		"id": 133,
		// ...
	}],
	"charts": [{
		"songID": 3,
		"difficulty": "ANOTHER",
		"__playcount": 1049,
		// ...
	}, {
		"songID": 133,
		"difficulty": "ANOTHER",
		"__playcount": 120
	},
		//...
	]
}
```

*****

## Retrieve a chart at a specific ID.

`GET /api/v1/games/:game/:playtype/charts/:chartID`

### Parameters

None.

### Response

| Property | Type | Description |
| :: | :: | :: |
| `song` | SongDocument | The parent song for this chart. |
| `chart` | ChartDocument | The requested chart document. |

### Example

#### Request
```
GET /api/v1/games/iidx/SP/charts/some_chart_id
```

#### Response

```json
{
	"song": {
		"id": 123,
		"title": "BLOCKS",
		// ...
	},
	"chart": {
		"chartID": "some_chart_id",
		"songID": 123,
		"playtype": "SP",
		// ...
	}
}
```

*****

## Return tierlist information for this chart

`GET /api/v1/games/:game/:playtype/charts/:chartID/tierlist`

Retrieve the tierlist information for this chart. If no tierlistID is provided, this falls back
to the GPT's default.

!!! warn
	If the GPT has no default tierlist, then the server will return a 501.

### Parameters

| Property | Type | Description |
| :: | :: | :: |
| `tierlistID` | string, Optional | Optionally, provide a tierlist ID to use instead of the default. |

### Response

| Property | Type | Description |
| :: | :: | :: |
| `tierlist` | TierlistDocument | The related tierlist document. |
| `tierlistData` | Array&lt;TierlistDataDocument&gt; | All of the tierlist data for this chart. |

### Example

#### Request
```
GET /api/v1/games/iidx/SP/charts/chart_id/tierlist
```

#### Response

```js
{
	tierlist: {
		game: "iidx",
		playtype: "SP",
		name: "Default IIDX SP Tierlist",
		// ...
	},
	tierlistData: [{
		type: "lamp",
		key: "HARD CLEAR",
		chartID: "chart_id",
		data: {
			value: 12.5,
			humanised: "C",
			flags: {}
		},
		// ...
	}, {
		type: "lamp",
		key: "CLEAR",
		chartID: "chart_id",
		data: {
			value: 12.4,
			humanised: "C",
			flags: {
				idvDifference: true
			}
		},
		// ...
	}]
}
```

*****
## Retrieve playcount for this chart.

`GET /api/v1/games/:game/:playtype/charts/:chartID/playcount`

### Parameters

None.

### Response

| Property | Type | Description |
| :: | :: | :: |
| `count` | Integer | The amount of plays on this chart. |

### Example

Self-explanatory.

*****

## Retrieve leaderboards for this chart.

`GET /api/v1/games/:game/:playtype/charts/:chartID/pbs`

### Parameters

| Property | Type | Description |
| :: | :: | :: |
| `startRanking` (Optional) | Specify a start point to return 100 pbs from. Defaults to 1. Inclusive. |

### Response

| Property | Type | Description |
| :: | :: | :: |
| `pbs` | Array&lt;PBDocument&gt; | The array of pbs sorted by ranking. |
| `users` | The users these PBs belong to. |

### Example

#### Request
```
GET /api/v1/games/iidx/SP/charts/some_chart/pbs
```

#### Response

```json
{
	"pbs": [{
		"chartID": "some_chart",
		"userID": 1,
		"rankingData": {
			"rank": 1,
			"outOf": 100,
		},
		// ...
	}, 
		//...
	],
	"users": [{
		"id": 1,
		"username": "zkldi",
		// ...
	},
		// ...
	]
}
```

*****

## Search for a user's PB on this chart.

`GET /api/v1/games/:game/:playtype/charts/:chartID/pbs/search`

### Parameters

| Property | Type | Description |
| :: | :: | :: |
| `search` | String | The user whose PB you're searching for. |

### Response

Same as `/api/v1/games/:game/:playtype/charts/:chartID/pbs`.

### Example

See Above.

*****

## Search a GPT's folders.

`GET /api/v1/games/:game/:playtype/folders`

### Parameters

| Property | Type | Description |
| :: | :: | :: |
| `search` | String | A string to search for a given folder. |

### Response

| Property | Type | Description |
| :: | :: | :: |
| `<body>` | Array&lt;FolderDocument&gt; | The folders that matched this search. |

### Example

#### Request
```
GET /api/v1/games/iidx/SP/folders?search=12
```

#### Response
```js
[{
	name: "beatmania IIDX Level 12",
	// ...
}]
```

*****

## Retrieve information on a specific folderID

`GET /api/v1/games/:game/folders/:folderID`

### Parameters

None.

### Response

| Property | Type | Description |
| :: | :: | :: |
| `songs` | Array&lt;SongDocument&gt; | The related song documents for this folder. |
| `charts` | Array&lt;ChartDocument&gt; | The related chart documents for this folder. |
| `folder` | FolderDocument | The folder document at this ID. |

### Example

#### Request
```
GET /api/v1/games/iidx/SP/folders/some_folder_id
```

#### Response

```js
{
	songs: [{
		id: 123,
		title: "Epic Song",
		artist: "foo bar",
		// ...
	}],
	charts: [{
		chartID: "foo_bar",
		songID: 123,
		difficulty: "ANOTHER",
		// ...
	}],
	folder: {
		name: "beatmania IIDX Level 12",
		folderID: "some_folder_id",
		// ...
	}
}
```

*****

## Return all the tables for this game

`GET /api/v1/games/:game/:playtype/tables`

!!! note
	Unlike the folders endpoint, this one doesn't have a search parameter. This is because we expect
	the total table count to stay rather small.

	If this changes in the future, this might become a paginated search like endpoint.

### Parameters

None.

### Response

| Property | Type | Description |
| :: | :: | :: |
| `tables` | Array&lt;TableDocument&gt; | Every table for this GPT. |

### Example

#### Request
```
GET /api/v1/games/bms/7K/tables
```

#### Response
```js
{
	tables: [
		{
			name: "Insane",
			// ...
		}, {
			name: "Overjoy",
			// ...
		}
	]
}

```

*****

## Retrieve folder documents for a specific table.

`GET /api/v1/games/:game/:playtype/tables/:tableID`

### Parameters

None.

### Response

| Property | Type | Description |
| :: | :: | :: |
| `folders` | Array&lt;FolderDocument&gt; | All of the folders for this table. |
| `table` | TableDocument | The table document at this ID. |

### Example

#### Request
```
GET /api/v1/games/bms/7K/tableID/insane
```

#### Response
```js
{
	folders: [
		// insane lv1, insane lv2 -- insane lv 25, so on.
	],
	table: {
		tableID: "insane",
		name: "Insane",
		// ...
	}
}
```

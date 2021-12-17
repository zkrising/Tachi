# Admin Endpoints

These endpoints are for adminstrator use. As such, they all
require an `authLevel` of atleast 3. For more information, see the [UserDocument](../../tachi-server/documents/user.md).

*****

## Change Server Log Level

`POST /api/v1/admin/change-log-level`

### Permissions

- Admin

### Parameters

| Property | Type | Description |
| :: | :: | :: |
| `logLevel` | "crit" \| "severe" \| "warn" \| "info" \| "verbose" \| "debug" | The log level to change to. |
| `duration` | Number, Optional | How long to keep this change for in minutes. If not set, defaults to 60 minutes. |
| `noReset` | Boolean, Optional | If true, do not ever reset this log level change. |

### Response

Empty Object.

### Example

#### Request
```
POST /api/v1/admin/change-log-level

{
	duration: 5,
	logLevel: "verbose"
}
```

#### Response

Empty Object.

*****

## Delete any Score

This performs all the necessary checks to remove a score document aswell.

`POST /api/v1/admin/delete-score`

### Permissions

- Admin

### Parameters

| Property | Type | Description |
| :: | :: | :: |
| `scoreID` | String | The scoreID to delete. |

### Response

Empty Object.

*****

## Resynchronise all PBs that match the given query or users.

`POST /api/v1/admin/resync-pbs`

!!! info
	This is intended to be used in the case that PBs fall out of
	sync with what they should be. This could be due to a
	database migration going awry, or anything else.

### Permissions

- Admin

### Parameters

| Property | Type | Description |
| :: | :: | :: |
| `userIDs` | Array&lt;Integer&gt; (Optional) | The list of userIDs to resynchronise PBs for. |
| `filters` | Mongo Query for the PBs Collection. (Optional) | A query to reduce the amount of PBs that get reprocessed. |

### Response

Empty Object.

### Example

#### Request
```
POST /api/v1/admin/resync-pbs
```

```js
{
	"filter": {
		"game": {$in: ["iidx","sdvx"]}
	},
	"userIDs": [1,2,3,4]
}
```

#### Response

Nothing.

*****

## Destroy a users GPT Profile and forces a leaderboard recalc.

`POST /api/v1/admin/destroy-ugpt`

!!! warning
	This is intended to completely remove a users GPT profile.
	You should use this **only** if a user has irrevocably screwed
	their account. Preferably early on!

### Permissions

- Admin

### Parameters

| Property | Type | Description |
| :: | :: | :: |
| `userID` | Integer | The user part of the UGPT. |
| `game` | Game | The game part of the UGPT. |
| `playtype` | Playtype | The PT part of the UGPT. Must be for the above game. |

### Response

Empty Object.

### Example

#### Request
```
POST /api/v1/admin/destroy-ugpt
```

```js
{
	"userID": 1,
	"game": "iidx",
	"playtype": "DP"
}
```

#### Response

Empty Object.

*****

## Destroy a chart and all of its scores.

`POST /api/v1/admin/destroy-chart`

### Permissions

- Admin

### Parameters

| Property | Type | Description |
| :: | :: | :: |
| `chartID` | String | The chartID you wish to destroy. |
| `game` | Game | The game this chart belongs to (Necessary for lookups). |

### Response

Empty Object.

### Example

#### Request
```
POST /api/v1/admin/destroy-chart
```
```js
{
	"chartID": "SomeChartID",
	"game": "iidx"
}
```

#### Response

Empty Object.

*****

## Perform a site recalc on this set of scores.

`POST /api/v1/admin/recalc`

### Permissions

- Admin

### Parameters

| Property | Type | Description |
| :: | :: | :: |
| `<body>` | Mongo Query for scores | Filters the amount of scores recalced. If not provided, defaults to every score on the site. |

### Response

| Property | Type | Description |
| :: | :: | :: |
| `scoresRecalced` | Integer | The amount of scores recalced. |

### Example

#### Request
```
POST /api/v1/admin/recalc
```
```js
{
	"game": "iidx",
	"scoreData.percent": {$gt: 90},
}
```

#### Response

```js
{
	"scoresRecalced": 174
}
```

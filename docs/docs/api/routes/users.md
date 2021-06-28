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

!!! note
	The :userID param has some special functionality,
	and any time you see it in these docs, that
	functionality is supported.

	You may pass the integer userID for this user - 1.
	You may also pass the username - zkldi.
	You may also pass the special string - `me` - which
	will select whatever user this authentication token
	is for.

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
OR
GET /api/v1/users/me WHEN authenticated as userID 1.
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

*****

## Change Profile Picture

`PUT /api/v1/users/:userID/pfp`

### Permissions

- customise_profile
- Must be the owner of this profile.

### Parameters

| Property | Type | Description |
| :: | :: | :: |
| `pfp` | JPG, or PNG | The new profile picture to set. |

!!! note
	This endpoint expects multipart form data.

### Response

| Property | Type | Description |
| :: | :: | :: |
| `get` | String | This contains the URL to then GET the new profile picture. |

### Example

#### Request
```
PUT /api/v1/users/1/pfp
```

```
// this is not a real multipart request, as those things
// are huge!
pfp=<somefiledata>
```

#### Response

```json
{
	"get": "/api/v1/users/1/pfp"
}
```

*****

## Get a user's profile picture.

`GET /api/v1/users/:userID/pfp`

### Parameters

None.

### Response

Not JSON. This returns the actual JPG or PNG stored for
this user.

### Example

N/A

*****

*****

## Unset your profile picture.

`DELETE /api/v1/users/:userID/pfp`

!!! note
	If you do not have a profile picture set, this is
	a 404 error.

### Permissions

- customise_profile
- Must be the owner of this profile.

### Parameters

None.
### Response

None.

### Example

Self-explanatory.

*****

## Change Profile Banner

`PUT /api/v1/users/:userID/banner`

### Permissions

- customise_profile
- Must be the owner of this profile.

### Parameters

| Property | Type | Description |
| :: | :: | :: |
| `banner` | JPG, or PNG | The new profile banner to set. |

!!! note
	This endpoint expects multipart form data.

### Response

| Property | Type | Description |
| :: | :: | :: |
| `get` | String | This contains the URL to then GET the new profile banner. |

### Example

#### Request
```
PUT /api/v1/users/1/banner
```

```
// this is not a real multipart request, as those things
// are huge!
banner=<somefiledata>
```

#### Response

```json
{
	"get": "/api/v1/users/1/banner"
}
```

*****

## Get a user's profile banner.

`GET /api/v1/users/:userID/banner`

### Parameters

None.

### Response

Not JSON. This returns the actual JPG or PNG stored for
this user.

### Example

N/A

*****

*****

## Unset your profile banner.

`DELETE /api/v1/users/:userID/banner`

!!! note
	If you do not have a profile banner set, this is
	a 404 error.

### Permissions

- customise_profile
- Must be the owner of this profile.

### Parameters

None.
### Response

None.

### Example

Self-explanatory.

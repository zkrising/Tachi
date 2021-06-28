# Individual User Endpoints

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




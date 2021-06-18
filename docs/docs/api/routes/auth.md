# Internal Authentication

These endpoints relate to internal authentication methods. Read the warning below.

!!! danger
	This is **NOT** for external use. You should **NEVER**
	be requesting a username and password from a user.

	Furthermore, interacting with this programmatically
	is near-impossible because you need to complete a CAPTCHA.

	This is documented for completeness' sake.

*****

## Login with username and password.

```POST /api/v1/login```

Logs a user in and returns a session cookie.

### Parameters

| Property | Type | Description |
| :: | :: | :: |
| username | string | The user's username. This is compared case-insensitively.
| password | string | The user's password. |
| captcha | string | |

### Response

| Property | Type | Description |
| :: | :: | :: |
| userID | integer | The ID of the user you authenticated as. |

| HTTP Header | Description |
| :: | :: |
| Set-Cookie | Contains a session cookie for future authentication. |

### Example

#### Request

```
POST /api/v1/auth/login
```

```json
{
	"username": "zkldi",
	"password": "my_password",
	"captcha": "herebedragons"
}
```

#### Response
```json
{
	"userID": 1
}
```

*****

## Register a new account.

`POST /api/v1/auth/register`

### Parameters

| Property | Type | Description |
| :: | :: | :: |
| `username` | string | A string between 3 and 20 characters. The first character must be A-Z, _ or -. The other 19 may be A-Z, 0-9, _ or -. |
| `password` | string | An 8 character or longer string. |
| `email` | string | |
| `inviteCode` (Kamaitachi Only) | string | If on Kamaitachi, this is the user's invitation code. |
| `captcha` | string | |


### Response

| Property | Type | Description |
| :: | :: | :: |
| `id` | integer | The newly-created user's ID. |
| `username` | string | The newly-created user's name. |

### Example

#### Request
```
POST /api/v1/auth/register
```

```json
{
	"username": "newguy",
	"password": "my_password",
	"captcha": "herebedragons",
	"email": "test@example.com"
}
```

#### Response

```json
{
	"id": 2,
	"username": "newguy"
}
```
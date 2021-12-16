# User Integrations

These endpoints are related to a users integrations with external services.

*****

## Retrieve whether this user is authenticated with this kaiType.

`GET /api/v1/users/:userID/integrations/kai/:kaiType`

**Kamaitachi Only**

!!! note
	A KaiType is either "flo", "min", or "eag". Since these three services
	share backends, they all use the same authentication mechanisms, and share
	endpoints like this.

### Permissions

- Self-key: This request must be made using Cookie authentication, which means it cannot be used with API keys.

### Response

| Property | Type | Description |
| :: | :: | :: |
| `authStatus` | boolean | True if the user is authenticated with this kaiType, false if they are not. |

### Example

#### Request
```
GET /api/v1/users/1/integrations/kai/flo
```

#### Response

```js
{
	authStatus: false
}
```

*****

## Update a user's access_token and refresh_token from an intermediate code.

`POST /api/v1/users/:userID/integrations/kai/:kaiType/oauth2callback`

**Kamaitachi Only**

!!! info
	This is used as part of an [OAuth2 Flow](https://www.digitalocean.com/community/tutorials/an-introduction-to-oauth-2).

	The client controls the callback link after authentication with the service, and then POSTs the returned `code` to us.
	This part of the flow actually updates the user.

### Permissions

- Self-key

### Parameters

| Property | Type | Description |
| :: | :: | :: |
| `code` | String | The intermediate code to use to get the access_token and refresh_token. |

### Response

Empty object for body. 200 on success, not 200 on failure - status code depending on error.

### Example

#### Request
```js
{
	code: "This_Is_An_1nT3rMeDIate_Code"
}
```

#### Response

```js
{}
```

*****

## Retrieve a users ARC integrations.

`GET /api/v1/users/:userID/integrations/arc`

**Kamaitachi Only**

### Permissions

- Self-Key

### Parameters

None.

### Response

| Property | Type | Description |
| :: | :: | :: |
| `iidx` | ArcAuthDoc \| null | Whether this user is authenticated for `api/arc-iidx` or not. |
| `sdvx` | See above | See above, but for `api/arc-sdvx`. |

### Example

#### Request
```
GET /api/v1/users/1/integrations/arc
```

#### Response

```js
{
	iidx: {
		userID: 1,
		accountID: "arc_account_id_here",
		forImportType: "api/arc-iidx"
	},
	sdvx: null
}
```

*****

## Update ARC Integrations

`PATCH /api/v1/users/:userID/integrations/arc`

### Permissions

- Self-Key

### Parameters

| Property | Type | Description |
| :: | :: | :: |
| `iidx` | Optional, String or Null | Change your configured AccountID for ARC IIDX. If not present, change nothing. If null, remove link, if string, update accountID. |
| `sdvx` | Optional, String or Null | See above, but for SDVX |


### Response

| Property | Type | Description |
| :: | :: | :: |
| `iidx` | ArcAuthDoc \| null | This user's current ArcAuthDoc (or null) for IIDX. |
| `sdvx` | ArcAuthDoc \| null | This user's current ArcAuthDoc (or null) for SDVX. |

### Example

#### Request
```js
PATCH /api/v1/users/1/integrations/arc

---
{
	iidx: "newAccountID",
	sdvx: null, // remove this account ID.
}
```

#### Response
```js
{
	iidx: {
		forImportType: "api/arc-iidx",
		accountID: "newAccountID",
		userID: 1
	},
	sdvx: null
}
```

!!! warning
	This endpoint doesn't do any checking on the `accountID` parameter to check whether it actually
	works with ARC. There is also no checking to see whether you're the owner of this account.

	Of course, this means you could trivially cheat by pointing your account at someone elses.
	This would be a violation of R2, and result in an account ban.

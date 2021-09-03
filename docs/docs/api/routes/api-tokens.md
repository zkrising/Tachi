# API Token Management

These endpoints relate to managing a users created API Tokens.
These tokens are likely to be generated from an OAuth2 integration, but in the future users may be able to create their own API Keys manually.

!!! note
	All of the below endpoints require [Self Key](../auth.md) level authentication. You cannot interact with these endpoints with Bearer auth.

*****

## Retrieve all API Tokens

`GET /api/v1/users/:userID/api-tokens`

### Parameters

None.

### Response

| Property | Type | Description |
| :: | :: | :: |
| `<body>` | APIKeyDocument | An array of APIKeyDocuments that belong to this user. |

### Example

#### Request
```
GET /api/v1/users/1/api-tokens
```

#### Response
```json
[{
	"identifier": "Fervidex Token",
	"token": "foobar",
	"permissions": {"submit_score": true},
	"userID": 1,
	"fromOAuth2Client": "FERVIDEX_OA2_CLIENT_ID"
}]
```

*****

## Delete a specific token.

`DELETE /api/v1/users/:userID/api-token/:token`

### Parameters

None.

### Response

Empty Object.

### Example

#### Request
```
DELETE /api/v1/users/1/api-token/foobar
```

#### Response
```json
{}
```

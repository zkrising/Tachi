# OAuth2 Client Management

These endpoints relate to managing your OAuth2 clients, such as creating new ones or deleting them.

For a detailed explaination on how to use the OAuth2 flow, you can check [Using OAuth2 With Tachi](../../codebase/batch-manual/oauth2.md)

*****

!!! warn
	All endpoints on this list require [Self Key](./user-integrations.md) level authentication.

	That is to say, it cannot be performed using Bearer tokens, and must be done by the user themselves.

*****

## Retrieve all clients you have created.

`GET /api/v1/oauth/clients`

### Parameters

None.

### Response

| Property | Type | Description |
| :: | :: | :: |
| `<body>` | Array&lt;OAuth2ClientDoc&gt; | All of the OAuth2 clients you have created. |

### Example

#### Request
```
GET /api/v1/oauth/clients
```

#### Response

```json
[{
	"name": "My Client",
	"clientID": "blah",
	"clientSecret": "secret!!",
	"requestPermissions": ["customise_profile"],
	"author": 1,
	"redirectUri": "https://example.com/callback",
}, 
	// ...
]
```

*****

## Create a new OAuth2 Client

`POST /api/v1/oauth/clients/create`

### Parameters

| Property | Type | Description |
| :: | :: | :: |
| `name` | String | A string between 3 and 80 characters. The name for this client. |
| `redirectUri` | String (Valid URI) | Must be a HTTP/HTTPS URL, This is where users will be sent to after clicking Yes on the prompt. |
| `permissions` | Array&lt;Permissions&gt; | An array of permissions this client requests. You can check all permissions [here](../auth.md). |

### Response

| Property | Type | Description |
| :: | :: | :: |
| `<body>` | OAuth2ClientDoc | The OAuth2Client you just created. |

### Example

#### Request
```
POST /api/v1/oauth/clients/create

{
	"name": "My Client",
	"redirectUri": "https://example.com/callback",
	"permissions": ["customise_profile"]
}
```

#### Response

```json
{
	"name": "My Client",
	"redirectUri": "https://example.com/callback",
	"requestedPermissions": ["customise_profile"],
	"clientID": "foobar",
	"clientSecret": "secret_val"
}
```

*****

## Retrieve information about a client

`GET /api/v1/oauth/clients/:clientID`

This is used to display information about this client to the user, when they are deciding on whether to authenticate it.

### Parameters

None.

### Response

| Property | Type | Description |
| :: | :: | :: |
| `<body>` | OAuth2ClientDoc without clientSecret | The client document at this ID. |

### Example

#### Request
```
GET /api/v1/oauth/clients/some_client_id
```

#### Response
```json
{
	"name": "Some Client",
	"requestedPermissions": ["customise_profile"],
	"clientID": "some_client_id",
	"author": 1,
	"redirectUri": "https://example.com/callback",
}
```

*****

## Modify existing client

`PATCH /api/v1/oauth/clients/:clientID`

### Permissions

- Must be the owner of this client.

### Parameters

| Property | Type | Description |
| :: | :: | :: |
| `name` | String | A string between 3 and 80 characters. |

!!! note
	This is the only modifiable property of an OAuth2 Client.

	If you need to change permissions, you should make another client.

### Response

| Property | Type | Description |
| :: | :: | :: |
| `<body>` | OAuth2ClientDoc | The new client document with the patched changes applied. |

### Example

#### Request
```
PATCH /api/v1/oauth/clients/some_client_id

{
	"name": "new name!"
}
```

#### Response

```json
{
	"name": "new name",
	"clientID": "some_client_id",
	// ... same props as in previous responses
}
```

*****

## Reset your client's secret.

`POST /api/v1/oauth/clients/:clientID/reset-secret`

!!! warn
	This does **NOT** reset api keys created by this client as per OAuth2 spec.
	
	If you need that functionality, you will need to delete
	your client.

### Permissions

- Must be the owner of this client.

### Parameters

None.

### Response

| Property | Type | Description |
| :: | :: | :: |
| `<body>` | OAuth2ClientDoc | The new client document with the new secret. |

### Example

#### Request
```
POST /api/v1/oauth/clients/some_client_id/reset-secret
```

#### Response
```json
{
	"name": "some client",
	"clientID": "some_client_id",
	"clientSecret": "FRESHLY_GENERATED_SECRET!",
	// ... more props
}
```

*****

## Delete your client.

`DELETE /api/v1/oauth/clients/:clientID`

### Permissions

- Must be the owner of this client.

### Parameters

None.

### Response

Empty Object.

### Example

#### Request
```
DELETE /api/v1/oauth/clients/some_client_id
```

#### Response
```json
{}
```

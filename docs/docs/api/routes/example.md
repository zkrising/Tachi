# Example Endpoint

*Endpoints will be formatted like this.*

*****

## Greet a user.

```GET /api/v1/greet```

This endpoint greets the user.

### Permissions

*If permissions are required, they will be listed here.*

- example_permission

### Parameters

*Parameters are required unless explicitly stated to be optional.*

!!! note
	As mentioned in API Overview, GET parameters are to be sent in the query string,
	and all other methods are to have their content in the request body as
	`application/json`.

| Property | Type | Description |
| :: | :: | :: |
| `name` | string | The name of the user to greet. |
| `birthday` (optional) | presence | Whether it is the user's birthday or not. |

Not providing required parameters will result in a 400 error.

### Response

*Parameters are always present unless stated to be conditional/optional.*

!!! info
	The below properties correspond to keys in the `body`
	property of a request.

	This means that the below table corresponds to
	```json
	{
		"success": true,
		"description": "Greeted user.",
		"body": {
			"greeting": "Hello, zkldi!",
			"wasBirthday": false,
		}
	}
	```


| Property | Type | Description |
| :: | :: | :: |
| `greeting` | string | A greeting for the user. |
| `wasBirthday` | boolean | Whether today is the users birthday or not. |

!!! info
	Since the above table corresponds to keys in the `body`
	property of a request, the special property name
	`<body>` refers to the body itself.

	For example:

	| Property | Type | Description |
	| :: | :: | :: |
	| `<body>` | string | The greeting. |

	Corresponds to:
	```json
	{
		"success": true,
		"description": "Greeted user.",
		"body": "Hello, zkldi!"
	}
	```

### Example

#### Request

```
GET /greet?name=zkldi
```

#### Response

```json
{
	"greeting": "Hello, zkldi!",
	"wasBirthday": false
}
```

!!! warning
	The example response is implicitly the `body` key of the API response.
	That is to say that, the real response for this request is:

	```json
	{
		"success": true,
		"description": "Greeted user.",
		"body": {
			"greeting": "Hello, zkldi!",
			"wasBirthday": false
		}
	}
	```

	This is omitted, because it's redundant all of the time.
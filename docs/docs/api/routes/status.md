# Status Checks

These endpoints are generally for programmers checking their code works.
They can also be used to check the status of the server.

*****

## Check server status.

```GET /api/v1/status```

This endpoint is a status check for the API and the consumer,
It's a good way of sanity checking whether your code works.

### Parameters

| Property | Type | Description |
| :: | :: | :: |
| `echo` | string | A string to echo. This is useful for checking whether parameters are sending over properly. |


### Response

| Property | Type | Description |
| :: | :: | :: |
| `serverTime` | integer | The current time of the server in Unix Milliseconds. |
| `whoami` | integer \| null | The userID you are authenticated as. If you are not authenticated, this is null. |
| `version` | string | The current version of Tachi-Server running. |
| `permissions` | Array&lt;string&gt; | The permissions this request had. |
| `echo` (Conditional) | string | If an `echo` parameter was provided, this is that exact parameter. |

### Example

`GET /api/v1/status?echo=helloworld`

```json
{
	"serverTime": 1623331110661,
	"version": "v2.0.0 (Mysterons)",
	"permissions": ["score:submit", "example:permission"],
	"echo": "helloworld"
}
```

*****

## Check server status with POST.

```POST /api/v1/status```

This endpoint is identical to `GET /status`, but it responds to POST requests,
and takes the `echo` parameter from the request body.

This is a good way to check whether your code sends JSON
bodies properly.

### Example

```json
POST /status
---
{
	"echo": "hello world"
}
```

```json
{
	"serverTime": 1623331110662,
	"version": "v2.0.0 (Mysterons)",
	"permissions": ["score:submit", "example:permission"],
	"echo": "hello world"
}
```
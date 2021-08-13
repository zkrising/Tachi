# Admin Endpoints

These endpoints are for adminstrator use.

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
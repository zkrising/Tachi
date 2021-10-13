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

*****

## Remove the isPrimary status from a chart

This also uncalcs all score data for scores on the chart.

`POST /api/v1/admin/deprimarify`

### Permissions

- Admin

### Parameters

| Property | Type | Description |
| :: | :: | :: |
| `chartID` | String | The chartID to deprimarify. |
| `game` | Game | The game this chart is on. |
| `songID` | Integer | Alternatively to chartID, you can specify this to deprimarify all charts on this songID. |

### Response

| Property | Type | Description |
| :: | :: | :: |
| `charts` | Array&lt;ChartDocument&gt; | The array of charts that were deprimarified |

*****

## Delete any Score

This performs all the necessary checks to remove a score document aswell

`POST /api/v1/admin/delete-score`

### Permissions

- Admin

### Parameters

| Property | Type | Description |
| :: | :: | :: |
| `scoreID` | String | The scoreID to delete. |

### Response

Empty Object.


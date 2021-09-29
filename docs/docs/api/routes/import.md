# Import Scores

*****

## Import scores from a file.

```POST /api/v1/import/file```

**Kamaitachi Only**.

Perform a score import that depends on a file, such as a .csv import.

### Permissions

- `submit_score`

### Parameters

This endpoint expects data in `multipart/form-data` form.
This is because we're handling file imports, and is the
appropriate way to send files.

| Property | Type | Description |
| :: | :: | :: |
| `importType` | string | The ImportType this import is for. This only accepts `file/` ImportTypes. |
| `scoreData` | file | The file to import scores from. |

| HTTP Header | Description |
| :: | :: |
| `X-User-Intent` (optional) | If this header is present, the request is assumed to have been sent with 'User Intent'. For more on this, see [Import Types](../../tachi-server/import/import-types.md) |

!!! info
	It's the responsibility of the API user to use the X-User-Intent
	header properly. It should only be used when the user
	has explicitly requested this import (i.e. not an automated script).

### Response

| Property | Type | Description |
| :: | :: | :: |
| `<body>` | ImportDocument | The Import Document created as a result of this import. |

### Example

#### Request
```
POST /api/v1/import/file
```

```
// this is not actually a multipart http request example
// as those are huge.

importType="file/eamusement-iidx-csv"
scoreData=<file data>
```

#### Response

```js
{
	"importType": "file/eamusement-iidx-csv",
	"idStrings": [
		"iidx:SP"
	],
	"scoreIDs": [
		"R6fad5f4947454d8238b45d6a1255d63be4da1130bf91fe9d05df29765a148da8"
	],
	"errors": [],
	"importID": "bea63277b54a5846bab1fd3a6ce54bfd41276857",
	"timeFinished": 1623352263023,
	"timeStarted": 1623352260445,
	"createdSessions": [
		{
			"sessionID": "Qb336d6b1cc0930747f161769a13238a41dce0004",
			"type": "Created"
		}
	],
	"userID": 1,
	"classDeltas": [],
	"goalInfo": [],
	"milestoneInfo": [],
	"userIntent": false, // if X-User-Intent was set, this would be true.
}
```

*****

## Synchronise scores up with an API.

`POST /api/v1/import/from-api`

This endpoint requests scores from an API to sync up with the requesting user's profile. This can
be performed programmatically, as long as the key has `submit_score` permissions.

!!! note
	The user must configure integration with these services up.

### Permissions

- `submit_score`

### Parameters

| Property | Type | Description |
| :: | :: | :: |
| `importType` | Any Supported API Import Type | The importType this synchronisation is for. |

### Response

| Property | Type | Description |
| :: | :: | :: |
| `<body>` | ImportDocument | Information about this import. |

### Example

#### Request
```
POST /api/v1/import/from-api

{
	importType: "api/flo-iidx"
}
```


#### Response

See previous big example.

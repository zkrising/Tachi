# User Document

- Stored in `users`.

*****

## Definition

```ts
interface PublicUserDocument {
	username: string;
	usernameLowercase: string;
	id: integer;
	socialMedia: {
		discord?: string | null;
		twitter?: string | null;
		github?: string | null;
		steam?: string | null;
		youtube?: string | null;
		twitch?: string | null;
	};
	lastSeen: integer;
	about: string;
	customPfp: boolean;
	customBanner: boolean;
	clan: string | null;
}
```

| Property | Description |
| :: | :: |
| `username` | This is guaranteed to be unique even across casings. Valid usernames match `/^[a-zA-Z_-][a-zA-Z0-9_-]{2,20}$/`. |
| `usernameLowercase` | Lowercased versions of usernames are stored so we can efficiently query whether a username exists. This means we don't have to do case insensitive searches! |
| `id` | This is a unique auto-incrementing integer for the user, and is completely immutable. |
| `socialMedia` | Contains popular social media sites and a way of referencing that user. |
| `lastSeen` | The last time this user made a request to Tachi. |
| `about` | This user's about me. This is evaluated as markdown. |
| `customPfp`, `customBanner` | Whether this user has a custom profile picture and banner. |
| `clan` | Currently unused. This will store a users clan tag if they are in a clan. |

## Example

```json
{
	"username": "test_zkldi",
	"usernameLowercase": "test_zkldi",
	"id": 1,
	"socialMedia": {
		"discord": "test_zkldi#1234",
		"steam": null
	},
	"lastSeen": null,
	"about": "test_user_not_real",
	"customPfp": true,
	"customBanner": true,
	"clan": null
}
```

!!! note
	An extension of the user document - `PrivateUserDocument`,
	is what is actually stored in the database.

	This appends two fields - `email` and `password`,
	and is not exposed over the API for obvious reasons.
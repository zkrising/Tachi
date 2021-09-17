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
	joinDate: integer;
	lastSeen: integer;
	about: string;
	status: string | null;
	customPfp: boolean;
	customBanner: boolean;
	clan: string | null; // todo
	badges: UserBadges[];
	authLevel: UserAuthLevels;
}
```

| Property | Description |
| :: | :: |
| `username` | This is guaranteed to be unique even across casings. Valid usernames match `/^[a-zA-Z_-][a-zA-Z0-9_-]{2,20}$/`. |
| `usernameLowercase` | Lowercased versions of usernames are stored so we can efficiently query whether a username exists. This means we don't have to do case insensitive searches! |
| `id` | This is a unique auto-incrementing integer for the user, and is completely immutable. |
| `socialMedia` | Contains popular social media sites and a way of referencing that user. |
| `lastSeen` | The last time this user made a request to Tachi. |
| `joinDate` | The time this user joined the site. |
| `about` | This user's about me. This is evaluated as markdown. |
| `status` | This users status. This is a short text field. |
| `customPfp`, `customBanner` | Whether this user has a custom profile picture and banner. |
| `clan` | Currently unused. This will store a users clan tag if they are in a clan. |
| `badges` | An array of badges for this user. This contains things like "beta" and "alpha" tester indicators. |
| `authLevel` | This users auth level. This is an enum stored inside tachi-common, where 0 states the user is banned. |

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
	"joinDate": 1234123412341,
	"about": "test_user_not_real",
	"customPfp": true,
	"customBanner": true,
	"clan": null,
	"badges": ["dev-team"],
	"authLevel": 3
}
```

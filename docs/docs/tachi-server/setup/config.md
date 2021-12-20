# Configuration Info

The codebase uses a file called `conf.json5` to handle
various configurable options. It also reads some things from the process environment.

## What is JSON5?

JSON5 is an extension of JSON which is better suited
for configuration files.

You can read more about it [here](https://json5.org/), but
the main benefits for us are as follows:

- Comments
- No Quoting properties
- Trailing Commas

## Example Config File

```js
{
	MONGO_DATABASE_NAME: "testingdb",
	CAPTCHA_SECRET_KEY: "something_secret",
	SESSION_SECRET: "something_secret",
	FLO_API_URL: "https://flo.example.com",
	EAG_API_URL: "https://eag.example.com",
	MIN_API_URL: "https://min.example.com",
	ARC_API_URL: "https://arc.example.com",
	FLO_OAUTH2_INFO: {
		CLIENT_ID: "DUMMY_CLIENT_ID",
		CLIENT_SECRET: "DUMMY_CLIENT_SECRET",
		REDIRECT_URI: "https://example.com",
	},
	EAG_OAUTH2_INFO: {
		CLIENT_ID: "DUMMY_CLIENT_ID",
		CLIENT_SECRET: "DUMMY_CLIENT_SECRET",
		REDIRECT_URI: "https://example.com",
	},
	ARC_AUTH_TOKEN: "unused",
	ENABLE_SERVER_HTTPS: false,
	OUR_URL: "https://example.com",
	INVITE_CODE_CONFIG: {
		BATCH_SIZE: 2,
		INVITE_CAP: 100,
		BETA_USER_BONUS: 5,
	},
	CDN_CONFIG: {
		WEB_LOCATION: "/cdn",
		SAVE_LOCATION: {
			TYPE: "LOCAL_FILESYSTEM",
			LOCATION: "./test-cdn",
			SERVE_OWN_CDN: true,
		},
	},
	TACHI_CONFIG: {
		TYPE: "omni",
		NAME: "Tachi Example Config",
		GAMES: [
			"iidx",
			"museca",
			"maimai",
			"sdvx",
			"ddr",
			"bms",
			"chunithm",
			"usc",
		],
		IMPORT_TYPES: [
			"file/eamusement-iidx-csv",
			"file/batch-manual",
			"file/solid-state-squad",
			"file/mer-iidx",
			"file/pli-iidx-csv",
			"ir/direct-manual",
			"ir/barbatos",
			"ir/fervidex",
			"ir/fervidex-static",
			"ir/beatoraja",
			"ir/usc",
			"ir/kshook-sv3c",
			"api/arc-iidx",
			"api/arc-sdvx",
			"api/eag-iidx",
			"api/eag-sdvx",
			"api/flo-iidx",
			"api/flo-sdvx",
			"api/min-sdvx",
		],
	},
	LOGGER_CONFIG: {
		FILE: false,
		CONSOLE: true,
		LOG_LEVEL: "info",
	},
}
```

!!! warning
	**DO NOT BLINDLY COPY THIS CONFIGURATION FILE!**

	Seriously, The `SESSION_SECRET` token MUST not be
	public.

## JSON5 Properties

All properties are required unless called optional or they have a default.

### MONGO_DATABASE_NAME

- Type: String

What collection to use for your database.

### CAPTCHA_SECRET_KEY

- Type: String

Google gives us a Captcha Secret Key in order for Captcha
to work on our site.

### SESSION_SECRET

- Type: String

This key is used to encrypt Session Cookies.

!!! warning
	If this key is figured out, anyone can log in as
	anyone.

	Make sure this is an appropriately long string
	generated from a *cryptographically secure* source. 
	That is, do not just mash your keyboard.

	You can generate secure random strings with something 
	like [KeePass](https://keepass.info/).

### FLO_API_URL, EAG_API_URL, MIN_API_URL, and ARC_API_URL

- Type: String

The URL for the `FLO, EAG, MIN or ARC` services. This is used for integration
with the Kamaitachi version of Tachi.

### FLO/MIN/EAG_OAUTH2_INFO

- Type: OAuth2Info (Optional)

If present, these define our OAuth2 Client data for interacting with these services. These are like this like this:
```js
{
	FLO_OAUTH2_INFO: {
		CLIENT_ID: "OUR_CLIENT_ID",
		CLIENT_SECRET: "OUR_CLIENT_SECRET",
		REDIRECT_URI: "https://tachi.example.com"
	}
}
```

!!! warning
	The server will throw a fatal error if you have OAUTH2_INFO set for one service, but not an API_URL.

	Maybe a better solution would be to have the API_URL inside the OAUTH2_INFO. Ah well.

### ARC_AUTH_TOKEN

- Type: String

We use an ARC session token in order to pull scores from `ARC`. The session token is stored here.

### ENABLE_SERVER_HTTPS

- Type: Boolean (optional)

Whether to use HTTPS. If this is set to true, the files `cert/key.pem` and `cert/cert.pem` will be
used as the privateKey and the certificate, respectively.

!!! note
	In production, we use an Nginx reverse proxy which handles this.
	A warning will be emitted if you are using HTTPS mode, as it's not generally meant to be used
	at this level.

### CLIENT_DEV_SERVER

- Type: String
- Default: Null

If present, and a string, this points to the webpack dev server for a react app. Having this
option set results in CORS being enabled for *that* specific URL. This is useful for local
development, but should not be used in production.


### RATE_LIMIT

- Type: Positive Integer
- Default: 500

Determines how many requests an APIKey OR IP can make every minute.

The default is set to the very generous 500, as it's possible for users to accidentally hit 100 requests/min by refreshing very fast.

### OAUTH_CLIENT_CAP

- Type: Positive Integer
- Default: 15

The amount of OAuth2Clients one user can create at any one time. Defaults to 15.

### OPTIONS_ALWAYS_SUCCEEDS

- Type: Boolean
- Default: false

If true, all `OPTIONS` requests to the server will return `200`, no matter what. This is a hack used for development CORS.

### USE_EXTERNAL_SCORE_IMPORT_WORKER

- Type: Boolean
- Default: false

If true, an external worker process will be used to handle score imports.

!!! warning
	You have to run this worker yourself. The entry point is `src/lib/score-import/worker/worker.ts`.

### EXTERNAL_SCORE_IMPORT_WORKER_CONCURRENCY

- Type: Integer
- Default: 10

How many score imports one worker should be allowed to work on at a time. This improves parallelisation of score imports.

### USC_QUEUE_SIZE

- Type: Integer
- Default: 3

How many unique players have to have a score on a chart for it to be de-orphaned.

!!! warning
	The lowest legal value for this field is 2.

### BEATORAJA_QUEUE_SIZE

- Type: Integer
- Default: 3

How many unique players have to have played a chart on the beatoraja IR for it to be de-orphaned.

!!! note
	Note that LR2 scores or database imports do not count towards this total.

!!! warning
	The lowest legal value for this field is 2.

### OUR_URL

- Type: String

Where *this* server is hosted. This is used to
provide callback URLs inside emails. You may stub
it out if emails are unsupported.


### EMAIL_CONFIG

- Type: EMAIL_CONFIG | undefined.

Configures how emails will be sent by Tachi.
If not present, email calls will become no-ops, and
certain features (such as resetting passwords)
will be disabled.

`FROM` determines the email `From` header, and optionally
`SENDMAIL_BIN` can override the location of the `sendmail`
binary. Defaults to `/usr/bin/sendmail`, but some distros
may have it in `sbin`.

`TRANSPORT_OPS` Passes a set of options to the email transport. For more
information, see the nodemailer documentation for SMTPTransport.Options.

```ts
interface EMAIL_CONFIG {
	FROM: string;
	SENDMAIL_BIN?: string
	TRANSPORT_OPS: any;
}
```

### INVITE_CODE_CONFIG

- Type: INVITE_CODE_CONFIG (Optional)

Configures how invites are created by Tachi.
If not present, the site will not require invite codes at all.

`BATCH_SIZE` determines how many invites to create every month,
`INVITE_CAP` determines how many invites a user can have -- ever.
`BETA_USER_BONUS` determines how many additional invites users of Kamaitachi 1 have out of the box.

```ts
interface INVITE_CODE_CONFIG: {
	BATCH_SIZE: integer;
	INVITE_CAP: integer;
	BETA_USER_BONUS: integer;
};
```

### TACHI_CONFIG

- Type: TACHI_CONFIG

Configures what the Tachi Server instance supports, and what it's generally doing.

```ts
interface TACHI_CONFIG: {
	NAME: string;
	TYPE: "ktchi" | "btchi" | "omni";
	GAMES: Game[];
	IMPORT_TYPES: ImportTypes[];
}
```

#### NAME

The name of the server. This is reported at `/api/v1/status`.

#### TYPE

What type of tachi-server this is. `ktchi` will enable Kamaitachi Only routes, `btchi` will enable
Bokutachi only routes, and `omni` will enable both.

#### GAMES

What games are supported by this server. For more information, see [Games](../../user/games.md).

#### IMPORT_TYPES

What importTypes are legal for this server. For more information, see [Import Types](../import/import-types.md).

### LOGGER_CONFIG

- Type: LOGGER_CONFIG (Optional)

Configures how logs are sent around in Tachi.

```ts
interface LOGGER_CONFIG: {
	LOG_LEVEL: "debug" | "verbose" | "info" | "warn" | "error" | "severe" | "crit";
	CONSOLE: boolean;
	FILE: boolean;
	SEQ_API_KEY: string | undefined;
	DISCORD?: {
		WEBHOOK_URL: string;
		WHO_TO_TAG: string[];
	};
}
```

#### LOG_LEVEL

What log level to use out of the box. If no LOGGER_CONFIG is provided, defaults to "info".

#### CONSOLE

Whether to log to the console or not. If no LOGGER_CONFIG is provided, defaults to true.

#### FILE

Whether to log to a log file or not. If no LOGGER_CONFIG is provided, defaults to false.

#### SEQ_API_KEY

(Optional)

If present, this is an API Key for logging to a Seq server, which is set in the process environment.

If no LOGGER_CONFIG is provided, this is not set.

#### DISCORD

(Optional)

If present, this configures a discord `WEBHOOK_URL` to log info or higher messages to.
`WHO_TO_TAG` is an array of userIDs to tag in the case of a `severe` or `fatal` error.

If no LOGGER_CONFIG is provided, this is not set.

### CDN_CONFIG

- Type: CDN_CONFIG

Configures the CDN for the Tachi Server. For local development it's recommended you use a local filesystem share,
for production usage it's recommended you're behind a CDN.

```ts
interface CDN_CONFIG: {
	WEB_LOCATION: string;
	SAVE_LOCATION:
		| { TYPE: "LOCAL_FILESYSTEM"; LOCATION: string; SERVE_OWN_CDN?: boolean }
		| {
				TYPE: "S3_BUCKET";
				ENDPOINT: string;
				ACCESS_KEY_ID: string;
				SECRET_ACCESS_KEY: string;
				BUCKET: string;
				KEY_PREFIX?: string;
				REGION?: string;
		  };
}
```

#### WEB_LOCATION

Configures a URL to redirect users to when returning CDN contents. This could be something like `cdn.bokutachi.xyz`.

#### SAVE_LOCATION

Configures where files are actually saved to. If TYPE is "LOCAL_FILESYSTEM", it will save to `SAVE_LOCATION.LOCATION` on the servers drive.

If TYPE is "S3_BUCKET", it will save files to an S3-API compatible bucket, like S3 itself or Backblaze.

!!! note
	LOCAL_FILESYSTEM's `SERVE_OWN_CDN` option is useful for local development, it will mount your cdn as an express endpoint under `/cdn`.
	
	This saves you having to set up your own NGINX box for serving local files.

## Process Environment

The process environment also contains necessary things for functional Tachi Server running.

!!! info
	These variables are put into the process environment instead of the conf.json5 file because
	they're easier to change between docker instances. Helps us scale and deploy.

### PORT

The PORT environment variable specifies what port our express server should listen to.
If not set, this will log a warning and default to 8080.

### MONGO_URL

Where our mongoDB instance is. This would be `127.0.0.1:27017` if hosting on the same box.
If not set, this will terminate the process with a critical error.

### SEQ_URL

Where a Seq instance is. If no `LOGGER_CONFIG.SEQ_API_KEY` was defined, this is fine. If it was,
this will log a warning, and nothing will be sent to Seq.

### NODE_ENV

Expected to be either "dev", "production", "staging" or "test". If not set, this will terminate the process.

### REPLICA_IDENTITY

Optional. If present, this declares the identity of this server as a replica.
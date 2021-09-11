# Configuration Info

The codebase uses a file called `conf.json5` to handle
various configurable options.

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
	MONGO_CONNECTION_URL: "localhost:27017",
	MONGO_DATABASE_NAME: "tachidb",
	LOG_LEVEL: "info",
	CAPTCHA_SECRET_KEY: "secret_key",
	SESSION_SECRET: "other_secret_key",
	FLO_API_URL: "https://flo.example.com",
	EAG_API_URL: "https://eag.example.com",
	MIN_API_URL: "https://min.example.com",
	ARC_API_URL: "https://arc.example.com",
	FLO_OAUTH2_INFO: {
		CLIENT_ID: "OUR_CLIENT_ID",
		CLIENT_SECRET: "OUR_CLIENT_SECRET",
		REDIRECT_URI: "https://tachi.example.com/callback"
	},
	// FLO_OAUTH2_INFO, EAG_OAUTH2_INFO and MIN_OAUTH2_INFO are all optional.
	ARC_AUTH_TOKEN: "unused",
	CDN_FILE_ROOT: "../tachi-cdn",
	PORT: 8080,
	CLIENT_INDEX_HTML_PATH: "./index.html",
	ENABLE_SERVER_HTTPS: true,
	TYPE: "omni",
	RUN_OWN_CDN: true,
	CLIENT_DEV_SERVER: null
}
```

!!! warning
	**DO NOT BLINDLY COPY THIS CONFIGURATION FILE!**

	Seriously, The `SESSION_SECRET` token MUST not be
	public.

## Properties

All properties are required.

### MONGO_CONNECTION_URL

- Type: String

Where your MongoDB server is located. For most cases, this
is `127.0.0.1:27017` or `localhost:27017`.

For more creative scenarios such as running through WSL, you
might need to change this.

### MONGO_DATABASE_NAME

- Type: String

What collection to use for your database.

### LOG_LEVEL

- Type: Log Level

Sets the level at which logs will be saved to disk/logged to console.

By default, this is `"info"`. The valid values can be found at [Logging Info](../infrastructure/logging.md).

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

### FLO_API_URL, EAG_API_URL and ARC_API_URL

- Type: String

The URL for the `FLO, EAG or ARC` services. This is used for integration
with the Kamaitachi version of Tachi.

### ARC_AUTH_TOKEN

- Type: String

We use an ARC session token in order to pull scores from `ARC`. The session token is stored here.

### CDN_FILE_ROOT

- Type: File Path

`tachi-server` expects a CDN to store things like replays
and profile pictures. This is a folder somewhere on the
system (presumably using nginx serve-static).

### PORT

- Type: Port (1-65536)

What port to run the server on.

!!! note
	Ports below 1024 are subject to strange UNIX rules - typically we run on 8080 and use
	an nginx reverse proxy.

### TYPE

- Type: "btchi" | "ktchi" | "omni"

What 'type' the instance of the server is.

"btchi" will run the server under Bokutachi mode, which
will disable Kamaitachi-only routes and change the names of various things.

"ktchi" will run the server under Kamaitachi mode, which
will disable Bokutachi-only routes and change various
names.

"omni" will run the server without any route restrictions.
This is used for testing.

### ENABLE_SERVER_HTTPS

- Type: Boolean

Whether to use HTTPS. If this is set to true, the files `cert/key.pem` and `cert/cert.pem` will be
used as the privateKey and the certificate, respectively.

!!! note
	In production, we use an Nginx reverse proxy which handles this.
	A warning will be emitted if you are using HTTPS mode, as it's not generally meant to be used
	at this level.

### RUN_OWN_CDN

- Type: Boolean

Whether to host the CDN using the same express process and and an `express.static()` call.
This is generally used for testing, or for simple local setups.

This uses `CDN_FILE_ROOT` to determine where the CDN's content should be.

### CLIENT_DEV_SERVER

- Type: String | NULL (Optional)

If present, and a string, this points to the webpack dev server for a react app. Having this
option set results in CORS being enabled for *that* specific URL. This is useful for local
development, but should not be used in production.

### FLO/MIN/EAG_OAUTH2_INFO

- Type: OAuth2Info | undefined

If present, these define our OAuth2 Client data for interacting with these services. These look like this:
```js
{
	FLO_OAUTH2_INFO: {
		CLIENT_ID: "OUR_CLIENT_ID",
		CLIENT_SECRET: "OUR_CLIENT_SECRET",
		REDIRECT_URI: "https://tachi.example.com"
	}
}
```

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

### NO_CONSOLE

- Type: Boolean
- Default: false

If true, logging to the console will be disabled, and only filesystem logging will be on.

### OAUTH_CLIENT_CAP

- Type: Integer
- Default: 15

Determines the maximum amount of OAuth Clients one user
can make.

### USC_QUEUE_SIZE

- Type: Integer
- Default: 3

Determines the amount of unique players that must have
played a chart for it to be available in the
database. This is to stop IR Flooding.

### BEATORAJA_QUEUE_SIZE

- Type: Integer
- Default: 3

See above, but for the beatorajaIR.

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

```ts
interface EMAIL_CONFIG {
	FROM: string;
	SENDMAIL_BIN?: string
}
```


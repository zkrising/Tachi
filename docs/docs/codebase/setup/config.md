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
	MONGO_CONNECTION_URL: "127.0.0.1:27017",
	MONGO_DATABASE_NAME: "somedb",
	LOG_LEVEL: "info",
	CAPTCHA_SECRET_KEY: "google_given_secret_key",
	SESSION_SECRET: "some_secret_key",
	FLO_API_URL: "https://flo.example.com",
	EAG_API_URL: "https://eag.example.com",
	ARC_API_URL: "https://arc.example.com",
	ARC_AUTH_TOKEN: "another_secret_key",
	CDN_ROOT: "./local-cdn",
	PORT: 8080,
	TYPE: "ktchi"
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

### CDN_ROOT

- Type: File Path

`tachi-server` expects a CDN to store things like replays
and profile pictures. This is a folder somewhere on the
system (presumably using nginx serve-static).

### PORT

- Type: Port (1-65536)

What port to run the server on.

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

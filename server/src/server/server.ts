// THIS IMPORT **MUST** GO HERE. DO NOT MOVE IT. IT MUST OCCUR BEFORE ANYTHING HAPPENS WITH EXPRESS
// BUT AFTER EXPRESS IS IMPORTED.
// eslint-disable-next-line import/order
import express from "express";
import "express-async-errors";

import { RequestLoggerMiddleware } from "./middleware/request-logger";
import mainRouter from "./router/router";
import connectRedis from "connect-redis";
import expressSession from "express-session";
import { RedisClient } from "external/redis/redis";
import helmet from "helmet";
import { SYMBOL_TACHI_API_AUTH } from "lib/constants/tachi";
import CreateLogCtx from "lib/logger/logger";
import { Environment, ServerConfig, TachiConfig } from "lib/setup/config";
import { IsNonEmptyString, IsRecord } from "utils/misc";
import type { Express } from "express";
import type { integer } from "tachi-common";

const logger = CreateLogCtx(__filename);

let store;

if (Environment.nodeEnv !== "test") {
	logger.info("Connecting ExpressSession to Redis.", { bootInfo: true });
	const RedisStore = connectRedis(expressSession);

	store = new RedisStore({
		host: "localhost",
		port: 6379,
		client: RedisClient,
		prefix: TachiConfig.NAME,
	});
}

const userSessionMiddleware = expressSession({
	// append node_env onto the end of the session name
	// so we can separate tokens under the same URL.
	// say for staging.kamaitachi.xyz
	name: `${TachiConfig.NAME.replace(/ /gu, "_")}_SESSION`,
	secret: ServerConfig.SESSION_SECRET,
	store,
	resave: true,
	saveUninitialized: false,
	cookie: {
		secure: Environment.nodeEnv === "production" || ServerConfig.ENABLE_SERVER_HTTPS,

		// Very important. Without this, we're vulnerable to CSRF!
		sameSite: "strict",
	},
});

const app: Express = express();

if (Environment.nodeEnv !== "production" && IsNonEmptyString(ServerConfig.CLIENT_DEV_SERVER)) {
	logger.warn(`Enabling CORS requests from ${ServerConfig.CLIENT_DEV_SERVER}.`, {
		bootInfo: true,
	});

	// Note: we have to assign it here to make sure it doesn't get modified!
	// If we try and use ServerConfig.CLIENT_DEV_SERVER inside the callback, TS rightly
	// complains that this value might end up being mutated to null/undefined.
	//
	// Even though we don't do that,
	// we may aswell be correct about the whole thing.
	const clientDevServerLocation = ServerConfig.CLIENT_DEV_SERVER;

	// Allow CORS requests from another server (since we have our dev server hosted separately).
	app.use((req, res, next) => {
		res.header("Access-Control-Allow-Origin", clientDevServerLocation);
		res.header(
			"Access-Control-Allow-Headers",
			"Origin, X-Requested-With, Content-Type, Accept, X-User-Intent"
		);
		res.header("Access-Control-Allow-Credentials", "true");
		res.header("Access-Control-Allow-Methods", "GET,POST,PATCH,PUT,DELETE,OPTIONS");
		next();
	});

	// hack to allow all OPTIONS requests. Remember that this setting should not be on in production!
	if (ServerConfig.OPTIONS_ALWAYS_SUCCEEDS === true) {
		app.options("*", (req, res) => res.send());
	}
} else {
	if (Environment.nodeEnv !== "test") {
		logger.info("Enabling Helmet, as no CLIENT_DEV_SERVER was set, or we are in production.", {
			bootInfo: true,
		});
	}

	app.use(helmet());
}

app.use(userSessionMiddleware);

// Most of these options are leveraged from KTAPI

// Pass the IP of the user up our increasingly insane chain of nginx/docker nonsense
app.set("trust proxy", ["loopback", "linklocal", "uniquelocal"]);

// we don't allow nesting in query strings.
app.set("query parser", "simple");

// taken from https://nodejs.org/api/process.html#process_event_unhandledrejection
// to avoid future deprecation.
process.on("unhandledRejection", (reason, promise) => {
	// @ts-expect-error reason is an error, and the logger can handle errors
	// it just refuses.
	logger.error(reason, { promise });
});

// enable reading json bodies
// limit them so as not to choke the api
app.use(express.json({ limit: "4mb" }));

app.use((req, res, next) => {
	// Always mount an empty req body. We operate under the assumption that req.body is
	// always defined as atleast an object.
	if (req.method !== "GET" && (typeof req.body !== "object" || req.body === null)) {
		req.body = {};
	}

	// req.safeBody *is* just a type-safe req.body!
	req.safeBody = req.body as Record<string, unknown>;

	next();
});

app.use(RequestLoggerMiddleware);

app.use("/", mainRouter);

// The SERVE_OWN_CDN option means that our /cdn path has to be hosted by us. In production,
// this is not the case (we have a dedicated nginx box for it running in a separate process).
// In dev, this is a pain to setup, so we can just run it locally.
if (
	ServerConfig.CDN_CONFIG.SAVE_LOCATION.TYPE === "LOCAL_FILESYSTEM" &&
	ServerConfig.CDN_CONFIG.SAVE_LOCATION.SERVE_OWN_CDN === true
) {
	if (Environment.nodeEnv === "production") {
		logger.warn(
			`Running LOCAL_FILESYSTEM OWN_CDN in production. Consider making a separate process handle your CDN for performance.`,
			{ bootInfo: true }
		);
	}

	logger.info(`Running own CDN at ${ServerConfig.CDN_CONFIG.SAVE_LOCATION.LOCATION}.`, {
		bootInfo: true,
	});

	app.use("/cdn", express.static(ServerConfig.CDN_CONFIG.SAVE_LOCATION.LOCATION));
	app.get("/cdn/*", (req, res) => res.status(404).send("No content here."));
}

// completely stolen from ktapi error handler
interface ExpressJSONErr extends SyntaxError {
	status: integer;
	message: string;
}

const MAIN_ERR_HANDLER: express.ErrorRequestHandler = (err, req, res, _next) => {
	logger.info(`MAIN_ERR_HANDLER hit by request.`, { url: req.originalUrl });

	if (err instanceof SyntaxError) {
		const expErr: ExpressJSONErr = err as ExpressJSONErr;

		if (expErr.status === 400 && "body" in expErr) {
			logger.info(`JSON Parsing Error?`, {
				url: req.originalUrl,
				userID: req[SYMBOL_TACHI_API_AUTH].userID,
			});
			return res.status(400).send({ success: false, description: err.message });
		}

		// else, this isn't a JSON parsing error
	}

	const unknownErr = err as unknown;

	if (IsRecord(unknownErr) && unknownErr.type === "entity.too.large") {
		return res.status(413).json({
			success: false,
			description: "Your request body was too large. The limit is 4MB.",
		});
	}

	logger.error("Fatal error propagated to server root? ", {
		err: unknownErr,
		url: req.originalUrl,
		authInfo: req[SYMBOL_TACHI_API_AUTH],
	});

	return res.status(500).json({
		success: false,
		description: "A fatal internal server error has occured.",
	});
};

app.use(MAIN_ERR_HANDLER);

export default app;

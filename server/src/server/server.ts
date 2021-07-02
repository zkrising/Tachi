import express, { Express } from "express";
import "express-async-errors";
import CreateLogCtx from "../lib/logger/logger";
import expressSession from "express-session";
import { integer } from "tachi-common";
import { RedisClient } from "../external/redis/redis";
import { CLIENT_INDEX_HTML_PATH, CONFIG, SESSION_SECRET } from "../lib/setup/config";
import connectRedis from "connect-redis";
import helmet from "helmet";
import fs from "fs";

const logger = CreateLogCtx(__filename);

let store;

if (process.env.NODE_ENV !== "test") {
	const RedisStore = connectRedis(expressSession);
	store = new RedisStore({
		host: "localhost",
		port: 6379,
		client: RedisClient,
	});
}

const userSessionMiddleware = expressSession({
	// append node_env onto the end of the session name
	// so we can separate tokens under the same URL.
	// say for staging.kamaitachi.xyz
	name: `${CONFIG.TYPE}_${process.env.NODE_ENV}_session`,
	secret: SESSION_SECRET,
	store,
	resave: true,
	saveUninitialized: false,
	cookie: {
		secure: process.env.NODE_ENV === "production",
	},
});

const app: Express = express();

app.use(helmet());

app.use(userSessionMiddleware);

// Most of these options are leveraged from KTAPI

// allow nginx to work its magic
app.set("trust proxy", "loopback");

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
app.use(express.json({ limit: "1mb" }));

app.use((req, res, next) => {
	if (req.method !== "GET" && !req.body) {
		req.body = {};
	}

	return next();
});

import mainRouter from "./router/router";

app.use("/", mainRouter);

const indexHTMLContent = fs.readFileSync(CLIENT_INDEX_HTML_PATH);

/**
 * If any user gets to this point, we send them index.html and yield routing to
 * the ktchi-client react router.
 * @name GET *
 */
app.get("*", (req, res) => res.setHeader("Content-Type", "text/html").send(indexHTMLContent));

/**
 * If any user gets to this point, and are not making a GET request, they are probably making an API request.
 * And want JSON back.
 * @name ALL (except GET) *
 */
app.all("*", (req, res) =>
	res.status(404).json({ success: false, description: "404: This URL does not exist." })
);

// completely stolen from ktapi error handler
interface ExpressJSONErr extends SyntaxError {
	status: integer;
	message: string;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const MAIN_ERR_HANDLER: express.ErrorRequestHandler = (err, req, res, next) => {
	if (err instanceof SyntaxError) {
		const expErr: ExpressJSONErr = err as ExpressJSONErr;
		if (expErr.status === 400 && "body" in expErr) {
			return res.status(400).send({ success: false, description: err.message });
		}

		// else, this isn't a JSON parsing error
	}

	logger.error(err, req.route);
	return res.status(500).json({
		success: false,
		description: "A fatal internal server error has occured.",
	});
};

app.use(MAIN_ERR_HANDLER);

export default app;

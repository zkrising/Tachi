import express from "express";
import "express-async-errors";
import createLogCtx from "./logger";
import expressSession from "express-session";
import connectRedis from "connect-redis";
import redis from "redis";
import { SESSION_SECRET } from "./secrets";

const logger = createLogCtx("server.ts");

const RedisStore = connectRedis(expressSession);
logger.info("Created Redis Store");

const RedisClient = redis.createClient();
logger.info("Created Redis Client");

const userSessionMiddleware = expressSession({
    // append node_env onto the end of the session name
    // so we can separate tokens under the same URL.
    // say, for staging.kamaitachi.xyz
    name: `ktblack_session_${process.env.NODE_ENV}`,
    secret: SESSION_SECRET,
    store: new RedisStore({
        host: "localhost",
        port: 6379,
        client: RedisClient,
    }),
    resave: true,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === "production",
    },
});

const app = express();

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

import internalApiRouter from "./internal-api/internal-api";
import { integer } from "./types";

app.use("/internal-api", internalApiRouter);

/**
 * If any user gets to this point, we send them index.html and let react router do the routing (and 404ing)
 * @name *
 */
app.get("*", (req, res) => res.status(200).send("todo"));

// completely stolen from ktapi error handler
interface ExpressJSONErr extends SyntaxError {
    status: integer;
    message: string;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const MAIN_ERR_HANDLER: express.ErrorRequestHandler = (err, req, res, _next) => {
    if (err instanceof SyntaxError) {
        let expErr: ExpressJSONErr = err as ExpressJSONErr;
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

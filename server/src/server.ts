import express from "express";
import "express-async-errors";
import createLogCtx from "./logger";

const logger = createLogCtx("server.ts");

// import internalApi from "./internal-api/internal-api";

const app = express();

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

app.use("/internal-api", internalApiRouter);

/**
 * If any user gets to this point, we send them index.html and let react router do the routing (and 404ing)
 * @name *
 */
app.get("*", async (req, res) => res.status(200).send("todo"));

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

        // else, wtf??, just fall through i guess
    }

    logger.error(err, req.route);
    return res.status(500).json({
        success: false,
        description: "A fatal internal server error has occured.",
    });
};

app.use(MAIN_ERR_HANDLER);

export default app;

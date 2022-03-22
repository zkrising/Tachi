import path from "path";
import express, { Express } from "express";
import { APITokenDocument, PublicUserDocument, WebhookEvents } from "tachi-common";
import { BotConfig } from "../config";
import { LoggerLayers } from "../data/data";
import db from "../database/mongo";
import { TachiServerV1Request, RequestTypes, TachiServerV1Get } from "../utils/fetchTachi";
import { CreateLayeredLogger } from "../utils/logger";
import { VERSION_PRETTY } from "../version";
import { HandleClassUpdateV1 } from "../webhookHandlers/classUpdate";
import { HandleGoalAchievedV1 } from "../webhookHandlers/goalAchieved";
import { ValidateWebhookRequest } from "./middleware";

export const app: Express = express();

const logger = CreateLayeredLogger(LoggerLayers.server);

app.use(express.json());

// Let NGINX work its magic.
app.set("trust proxy", "loopback");

// Disable query string nesting such as ?a[b]=4 -> {a: {b: 4}}. This
// almost always results in a painful security vuln.
app.set("query parser", "simple");

/**
 * Return the status of this bot and the version it's running.
 *
 * @name GET /
 */
app.get("/", (req, res) =>
	res.status(200).json({
		success: true,
		description: "Bot is online!",
		body: {
			time: Date.now(),
			version: VERSION_PRETTY,
		},
	})
);

/**
 * Our OAuth2 Callback handler. Note that this is a GET request, as per
 * OAuth spec, but does perform *real* mutations on data. It's awkward.
 *
 * @param code - The intermediate code for us to send back.
 * @param context - The discordID we fired this auth request with.
 *
 * @name GET /oauth/callback
 */
app.get("/oauth/callback", async (req, res) => {
	if (typeof req.query.code !== "string") {
		return res.status(400).send("Bad Request.");
	}

	if (typeof req.query.context !== "string") {
		return res.status(400).send("Bad Request.");
	}

	const tokenRes = await TachiServerV1Request<APITokenDocument>(
		RequestTypes.POST,
		"/oauth/token",
		null,
		{
			code: req.query.code,
			client_id: BotConfig.OAUTH.CLIENT_ID,
			client_secret: BotConfig.OAUTH.CLIENT_SECRET,
			grant_type: "authorization_code",
			redirect_uri: `${BotConfig.HTTP_SERVER.URL}/oauth/callback`,
		}
	);

	if (!tokenRes.success) {
		logger.error(
			`Failed to convert code ${req.query.code} to a token. ${tokenRes.description} Cannot auth.`
		);
		return res.status(401).json({
			success: false,
			description: "Failed to authenticate.",
		});
	}

	const discordID = req.query.context;
	const apiToken = tokenRes.body.token!;

	const whoamiRes = await TachiServerV1Get<PublicUserDocument>("/users/me", apiToken);

	if (!whoamiRes.success) {
		logger.severe("Failed to request user with token we just got?", { discordID });
		return res
			.status(500)
			.send(
				"Something's gone very wrong. An internal server error has occured. This has been reported."
			);
	}

	const user = whoamiRes.body;

	logger.info(`Saving user-discord-link for ${user.username} (#${user.id}).`);

	const existingLink = await db.discordUserMap.findOne({ userID: user.id });

	if (existingLink) {
		logger.info(`Updating user-discord-link for ${user.username} (#${user.id})`);

		await db.discordUserMap.update(
			{
				userID: user.id,
			},
			{
				$set: {
					discordID,
					tachiApiToken: apiToken,
				},
			}
		);
	} else {
		await db.discordUserMap.insert({
			discordID,
			tachiApiToken: apiToken,
			userID: user.id,
		});
	}

	return res.sendFile(path.join(__dirname, "../../pages/account-linked.html"));
});

/**
 * Listens for tachi-server style webhook calls.
 *
 * @name POST /webhook
 */
app.post("/webhook", ValidateWebhookRequest, async (req, res) => {
	// We can be reasonably assured that the request body will be
	// in this form. If it isn't, there are bigger problems!
	const webhookEvent = req.body as WebhookEvents;

	let statusCode = 200;

	switch (webhookEvent.type) {
		case "class-update/v1":
			statusCode = await HandleClassUpdateV1(webhookEvent.content);
			break;
		case "goals-achieved/v1":
			statusCode = await HandleGoalAchievedV1(webhookEvent.content);
			break;
		case "milestone-achieved/v1":
		default:
			// According to the types, this should never happen.
			// However, tachi-(server/common) may recieve an update
			// to define new webhooks, and the bot might not
			// get around to updating in time.
			logger.warn(
				`Received unknown webhook event ${
					(webhookEvent as WebhookEvents).type
				}. Have we got support for this?`
			);
			return res.status(501).json({
				success: false,
				description: `The type ${(webhookEvent as WebhookEvents).type} is unsupported.`,
			});
	}

	return res.sendStatus(statusCode);
});

/**
 * 404 Handler. If something gets to this point, they haven't matched with anything.
 *
 * @name ALL *
 */
app.all("*", (req, res) =>
	res.status(404).json({
		success: false,
		description: "Nothing found here.",
	})
);

interface ExpressJSONErr extends SyntaxError {
	status: number;
	message: string;
}

/**
 * A catch-all emergency error handler for express. This returns 500
 * on unknown errors, but has a hack in place to return 400 for JSON parsing
 * errors. This is because the default express JSON Body Parser throws a
 * fatal error on invalid JSON, but really, it should just be a return 400.
 */
// Although ESLint will whine about next being unused, it's necessary for
// express as it uses function arity to determine whether something is an
// error handler or not.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const MainExpressErrorHandler: express.ErrorRequestHandler = (err, req, res, _next) => {
	if (err instanceof SyntaxError) {
		const expErr: ExpressJSONErr = err as ExpressJSONErr;
		if (expErr.status === 400 && "body" in expErr) {
			logger.info(`Error in parsing JSON in request body from ${req.url}`, {
				url: req.originalUrl,
			});
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

app.use(MainExpressErrorHandler);

logger.info(`Starting express server on port ${BotConfig.HTTP_SERVER.PORT}.`);

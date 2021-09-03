import { Router } from "express";
import { SYMBOL_TachiData } from "lib/constants/tachi";
import prValidate from "server/middleware/prudence-validate";
import p from "prudence";
import db from "external/mongo/db";
import { GetClientFromID, RequireOwnershipOfClient } from "./middleware";
import { DedupeArr, IsValidURL, Random20Hex } from "utils/misc";
import CreateLogCtx from "lib/logger/logger";
import { APIPermissions } from "tachi-common";
import { AllPermissions } from "server/middleware/auth";
import { ServerConfig } from "lib/setup/config";
import { FormatUserDoc } from "utils/user";

const logger = CreateLogCtx(__filename);

const router: Router = Router({ mergeParams: true });

/**
 * Retrieve the clients you created. Must be performed with a session-level request.
 *
 * @warn This also returns the client_secrets! Those *have* to be kept secret.
 *
 * @name GET /api/v1/oauth/clients
 */
router.get("/", async (req, res) => {
	const user = req.session.tachi?.user;

	if (!user) {
		return res.status(401).json({
			success: false,
			description: `You are not authenticated (for a session-level request, atleast).`,
		});
	}

	const clients = await db["oauth2-clients"].find({
		author: user.id,
	});

	return res.status(200).json({
		success: true,
		description: `Returned ${clients.length} clients.`,
		body: clients,
	});
});

/**
 * Create a new OAuth2 Client. Requires session-level auth.
 *
 * @param name - A string that identifies this client.
 * @param redirectUri - The redirectUri this client uses.
 * @param permissions - An array of APIPermissions this client is expected to use.
 *
 * @name POST /api/v1/oauth/clients/create
 */
router.post(
	"/create",
	prValidate({
		name: p.isBoundedString(3, 80),
		redirectUri: "string",
		permissions: [p.isIn(Object.keys(AllPermissions))],
	}),
	async (req, res) => {
		if (!req.session.tachi?.user) {
			return res.status(401).json({
				success: false,
				description: `You are not authenticated.`,
			});
		}

		const existingClients = await db["oauth2-clients"].find({
			author: req.session.tachi.user.id,
		});

		if (existingClients.length >= ServerConfig.OAUTH_CLIENT_CAP) {
			return res.status(400).json({
				success: false,
				description: `You have created too many OAuth2 clients. The current cap is ${ServerConfig.OAUTH_CLIENT_CAP}.`,
			});
		}

		const permissions = DedupeArr<APIPermissions>(req.body.permissions);

		if (!IsValidURL(req.body.redirectUri)) {
			return res.status(400).json({
				success: false,
				description: `Invalid URL for ${req.body.redirectUri}.`,
			});
		}

		const clientID = Random20Hex();
		const clientSecret = Random20Hex();

		const clientDoc = {
			clientID,
			clientSecret,
			requestedPermissions: permissions,
			name: req.body.name,
			author: req.session.tachi.user.id,
			redirectUri: req.body.redirectUri,
		};

		await db["oauth2-clients"].insert(clientDoc);

		logger.info(
			`User ${FormatUserDoc(req.session.tachi.user)} created a new OAuth2 Client ${
				req.body.name
			} (${clientID}).`
		);

		return res.status(200).json({
			success: true,
			description: `Created a new OAuth2 client.`,
			body: clientDoc,
		});
	}
);

/**
 * Retrieves information about the client at this ID.
 *
 * @name GET /api/v1/oauth/clients/:clientID
 */
router.get("/:clientID", GetClientFromID, (req, res) => {
	const client = req[SYMBOL_TachiData]!.oauth2ClientDoc!;

	return res.status(200).json({
		success: true,
		description: `Retrieved client ${client.name}.`,
		body: client,
	});
});

/**
 * Update an existing client. The requester must be the owner of this
 * client, and must also be making a session-level request.
 *
 * @param name - Change the name of this client. This is the only option at
 * the moment, and I do not imagine that will change.
 *
 * @name PATCH /api/v1/oauth/clients/:clientID
 */
router.patch(
	"/:clientID",
	GetClientFromID,
	RequireOwnershipOfClient,
	prValidate({ name: p.isBoundedString(3, 80) }),
	async (req, res) => {
		const client = req[SYMBOL_TachiData]!.oauth2ClientDoc!;

		const newClient = await db["oauth2-clients"].findOneAndUpdate(
			{
				clientID: client.clientID,
			},
			{
				$set: {
					name: req.body.name,
				},
			}
		);

		logger.info(
			`OAuth2 Client ${client.name} (${client.clientID}) has been renamed to ${req.body.name}.`
		);

		return res.status(200).json({
			success: true,
			description: `Updated client.`,
			body: newClient,
		});
	}
);

/**
 * Resets the clientSecret for this client.
 * This will NOT invalidate any existing tokens, as per oauth2 spec.
 *
 * @name POST /api/v1/oauth/clients/:clientID/reset-secret
 */
router.post(
	"/:clientID/reset-secret",
	GetClientFromID,
	RequireOwnershipOfClient,
	async (req, res) => {
		const client = req[SYMBOL_TachiData]!.oauth2ClientDoc!;
		const clientName = `${client.name} (${client.clientID})`;

		logger.info(`Recieved request to reset client secret for ${clientName}`);

		const newSecret = Random20Hex();

		const newClient = await db["oauth2-clients"].findOneAndUpdate(
			{
				clientID: client.clientID,
			},
			{
				$set: { clientSecret: newSecret },
			}
		);

		logger.info(`Reset secret for ${clientName}.`);

		return res.status(200).json({
			success: true,
			description: `Reset secret.`,
			body: newClient,
		});
	}
);

/**
 * Delete this client. Must be authorized at a session-request level.
 *
 * @name DELETE /api/v1/oauth/clients/:clientID
 */
router.delete("/:clientID", GetClientFromID, RequireOwnershipOfClient, async (req, res) => {
	const client = req[SYMBOL_TachiData]!.oauth2ClientDoc!;

	const clientName = `${client.name} (${client.clientID})`;

	logger.info(`Recieved request to destroy OAuth2 Client ${client.name} (${client.clientID})`);

	logger.verbose(`Removing OAuth2 Client ${clientName}.`);
	await db["oauth2-clients"].remove({
		clientID: client.clientID,
	});
	logger.info(`Removed OAuth2 Client ${clientName}.`);

	logger.verbose(`Removing all associated api tokens.`);
	const result = await db["api-tokens"].remove({
		fromOAuth2Client: client.clientID,
	});
	logger.info(`Removed ${result.deletedCount} api tokens from ${clientName}.`);

	return res.status(200).json({
		success: true,
		description: `Deleted ${clientName}.`,
		body: {},
	});
});

export default router;

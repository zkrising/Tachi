import { GetClientFromID, RequireOwnershipOfClient } from "./middleware";
import { Router } from "express";
import db from "external/mongo/db";
import CreateLogCtx from "lib/logger/logger";
import { ServerConfig } from "lib/setup/config";
import p from "prudence";
import prValidate from "server/middleware/prudence-validate";
import { ALL_PERMISSIONS, UserAuthLevels } from "tachi-common";
import { DedupeArr, DeleteUndefinedProps, IsValidURL, Random20Hex } from "utils/misc";
import { optNull } from "utils/prudence";
import { GetTachiData } from "utils/req-tachi-data";
import { FormatUserDoc } from "utils/user";
import type { APIPermissions, TachiAPIClientDocument } from "tachi-common";

const logger = CreateLogCtx(__filename);

const router: Router = Router({ mergeParams: true });

/**
 * Retrieve the clients you created. Must be performed with a session-level request.
 *
 * @warn This also returns the client_secrets! Those *have* to be kept secret.
 *
 * @name GET /api/v1/clients
 */
router.get("/", async (req, res) => {
	const user = req.session.tachi?.user;

	if (!user) {
		return res.status(401).json({
			success: false,
			description: `You are not authenticated (for a session-level request, atleast).`,
		});
	}

	const clients = await db["api-clients"].find({
		author: user.id,
	});

	return res.status(200).json({
		success: true,
		description: `Returned ${clients.length} clients.`,
		body: clients,
	});
});

/**
 * Create a new API Client. Requires session-level auth.
 *
 * @param name - A string that identifies this client.
 * @param redirectUri - The redirectUri this client uses.
 * @param webhookUri - Optionally, a webhookUri to call with webhook events.
 * @param apiKeyTemplate - Optionally, a static format to apply when doing static auth.
 * @param apiKeyFilename - Optionally, a filename to automatically download the template to, when doing
 * static flow.
 * @param permissions - An array of APIPermissions this client is expected to use.
 *
 * @name POST /api/v1/clients/create
 */
router.post(
	"/create",
	prValidate({
		name: p.isBoundedString(3, 80),
		redirectUri: "?string",
		webhookUri: "?string",
		apiKeyTemplate: (self) => {
			if (self === null) {
				return true;
			}

			if (typeof self !== "string") {
				return "Expected a string.";
			}

			if (!self.includes("%%TACHI_KEY%%")) {
				return "Must contain %%TACHI_KEY%% as part of the template.";
			}

			return true;
		},
		apiKeyFilename: "?string",
		permissions: [p.isIn(Object.keys(ALL_PERMISSIONS))],
	}),
	async (req, res) => {
		if (!req.session.tachi?.user) {
			return res.status(401).json({
				success: false,
				description: `You are not authenticated.`,
			});
		}

		const body = req.safeBody as {
			name: string;
			redirectUri: string | null;
			webhookUri: string | null;
			apiKeyTemplate: string | null;
			apiKeyFilename: string | null;
			permissions: Array<APIPermissions>;
		};

		const existingClients = await db["api-clients"].find({
			author: req.session.tachi.user.id,
		});

		// Note: Admins are excluded from the API client cap.
		if (
			req.session.tachi.user.authLevel !== UserAuthLevels.ADMIN &&
			existingClients.length >= ServerConfig.OAUTH_CLIENT_CAP
		) {
			return res.status(400).json({
				success: false,
				description: `You have created too many API clients. The current cap is ${ServerConfig.OAUTH_CLIENT_CAP}.`,
			});
		}

		const permissions = DedupeArr<APIPermissions>(body.permissions);

		if (permissions.length === 0) {
			return res.status(400).json({
				success: false,
				description: `Invalid permissions -- Need to require atleast one.`,
			});
		}

		if (body.redirectUri !== null && !IsValidURL(body.redirectUri)) {
			return res.status(400).json({
				success: false,
				description: `Invalid Redirect URL.`,
			});
		}

		if (body.webhookUri !== null && !IsValidURL(body.webhookUri)) {
			return res.status(400).json({
				success: false,
				description: `Invalid Webhook URL.`,
			});
		}

		const clientID = `CI${Random20Hex()}`;
		const clientSecret = `CS${Random20Hex()}`;

		const clientDoc: TachiAPIClientDocument = {
			clientID,
			clientSecret,
			requestedPermissions: permissions,
			name: body.name,
			author: req.session.tachi.user.id,
			redirectUri: body.redirectUri,
			webhookUri: body.webhookUri ?? null,
			apiKeyFilename: body.apiKeyFilename ?? null,
			apiKeyTemplate: body.apiKeyTemplate ?? null,
		};

		await db["api-clients"].insert(clientDoc);

		logger.info(
			`User ${FormatUserDoc(req.session.tachi.user)} created a new API Client ${
				body.name
			} (${clientID}).`
		);

		return res.status(200).json({
			success: true,
			description: `Created a new API client.`,
			body: clientDoc,
		});
	}
);

/**
 * Retrieves information about the client at this ID.
 *
 * @name GET /api/v1/clients/:clientID
 */
router.get("/:clientID", GetClientFromID, (req, res) => {
	const client = GetTachiData(req, "apiClientDoc");

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
 * @param name - Change the name of this client.
 * @param webhookUri - Change a bound webhookUri for this client.
 * @param redirectUri - Change a bound redirectUri for this client.
 * @param apiKeyFormat - Change the APIKeyFormat for this client.
 * @param apiKeyFilename - Change the APIKeyFilename for this client.
 *
 * @name PATCH /api/v1/clients/:clientID
 */
router.patch(
	"/:clientID",
	GetClientFromID,
	RequireOwnershipOfClient,
	prValidate({
		name: p.optional(p.isBoundedString(3, 80)),
		apiKeyTemplate: optNull((self) => {
			if (typeof self !== "string") {
				return "Expected a string.";
			}

			if (!self.includes("%%TACHI_KEY%%")) {
				return "Must contain a %%TACHI_KEY%% placeholder.";
			}

			return true;
		}),
		apiKeyFilename: optNull(p.isBoundedString(3, 80)),
		webhookUri: optNull((self) => {
			if (typeof self !== "string") {
				return "Expected a string.";
			}

			const res = IsValidURL(self);

			if (!res) {
				return "Invalid URL.";
			}

			return true;
		}),
		redirectUri: optNull((self) => {
			if (typeof self !== "string") {
				return "Expected a string.";
			}

			const res = IsValidURL(self);

			if (!res) {
				return "Invalid URL.";
			}

			return true;
		}),
	}),
	async (req, res) => {
		const body = req.safeBody as {
			name?: string;
			redirectUri?: string | null;
			webhookUri?: string | null;
			apiKeyTemplate?: string | null;
			apiKeyFilename?: string | null;
			permissions?: Array<APIPermissions>;
		};

		const client = GetTachiData(req, "apiClientDoc");

		DeleteUndefinedProps(req.safeBody);

		if (Object.keys(req.safeBody).length === 0) {
			return res.status(400).json({
				success: false,
				description: `No changes to make.`,
			});
		}

		const newClient = await db["api-clients"].findOneAndUpdate(
			{
				clientID: client.clientID,
			},
			{
				$set: req.safeBody,
			}
		);

		logger.info(
			`API Client ${client.name} (${client.clientID}) has been renamed to ${body.name}.`
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
 * @name POST /api/v1/clients/:clientID/reset-secret
 */
router.post(
	"/:clientID/reset-secret",
	GetClientFromID,
	RequireOwnershipOfClient,
	async (req, res) => {
		const client = GetTachiData(req, "apiClientDoc");
		const clientName = `${client.name} (${client.clientID})`;

		logger.info(`received request to reset client secret for ${clientName}`);

		const newSecret = Random20Hex();

		const newClient = await db["api-clients"].findOneAndUpdate(
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
 * @name DELETE /api/v1/clients/:clientID
 */
router.delete("/:clientID", GetClientFromID, RequireOwnershipOfClient, async (req, res) => {
	const client = GetTachiData(req, "apiClientDoc");

	const clientName = `${client.name} (${client.clientID})`;

	logger.info(`received request to destroy API Client ${client.name} (${client.clientID})`);

	logger.verbose(`Removing API Client ${clientName}.`);
	await db["api-clients"].remove({
		clientID: client.clientID,
	});
	logger.info(`Removed API Client ${clientName}.`);

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

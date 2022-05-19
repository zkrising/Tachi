import { RequireSelfRequestFromUser } from "../middleware";
import { Router } from "express";
import db from "external/mongo/db";
import CreateLogCtx from "lib/logger/logger";
import p from "prudence";
import prValidate from "server/middleware/prudence-validate";
import { ALL_PERMISSIONS } from "tachi-common";
import { Random20Hex } from "utils/misc";
import { GetTachiData } from "utils/req-tachi-data";
import { FormatUserDoc } from "utils/user";
import type { APIPermissions, APITokenDocument } from "tachi-common";

const logger = CreateLogCtx(__filename);

const router: Router = Router({ mergeParams: true });

router.use(RequireSelfRequestFromUser);

/**
 * Retrieve this users API tokens.
 * This request MUST be performed with session-level auth.
 *
 * @name GET /api/v1/users/:userID/api-tokens
 */
router.get("/", async (req, res) => {
	const user = GetTachiData(req, "requestedUser");

	const keys = await db["api-tokens"].find({
		userID: user.id,
	});

	return res.status(200).json({
		success: true,
		description: `Returned ${keys.length} keys.`,
		body: keys,
	});
});

/**
 * Create a new API token.
 *
 * @param clientID - Create a token that has the permissions implied from this client.
 * @param identifier - A user provided string to identify this API Key.
 * @param permissions - An array of strings dictating what permissions to create with.
 * This is incompatible with the first option.
 *
 * @name POST /api/v1/users/:userID/api-tokens/create
 */
router.post(
	"/create",
	prValidate({
		permissions: p.optional([p.isIn(Object.keys(ALL_PERMISSIONS))]),
		identifier: "*string",
		clientID: "*string",
	}),
	async (req, res) => {
		const body = req.safeBody as {
			permissions?: Array<APIPermissions>;
			identifier?: string;
			clientID?: string;
		};

		if (body.clientID !== undefined && body.permissions) {
			return res.status(400).json({
				success: false,
				description: `Cannot use ClientID creation and permissions creation at the same time!`,
			});
		}

		let permissions: Array<APIPermissions>;

		const user = GetTachiData(req, "requestedUser");

		let identifier: string;
		let fromAPIClient = null;

		if (body.clientID !== undefined) {
			const client = await db["api-clients"].findOne(
				{
					clientID: body.clientID,
				},
				{
					projection: {
						clientSecret: 0,
					},
				}
			);

			if (!client) {
				return res.status(404).json({
					success: false,
					description: `This client does not exist.`,
				});
			}

			const exists = await db["api-tokens"].findOne({
				userID: user.id,
				fromAPIClient: client.clientID,
			});

			if (exists) {
				return res.status(200).json({
					success: true,
					description: `Returned existing key`,
					body: exists,
				});
			}

			permissions = client.requestedPermissions;
			identifier = client.name;
			fromAPIClient = client.clientID;

			logger.info(
				`Creating API Key for ${FormatUserDoc(user)} from ${client.name} specification.`
			);
		} else if (body.permissions) {
			permissions = body.permissions;
			identifier = body.identifier ?? "Custom Token";

			logger.info(
				`Creating API Key for ${FormatUserDoc(user)} with ${permissions.join(", ")}.`
			);
		} else {
			return res.status(400).json({
				success: false,
				description: `Invalid request, must specify either clientID or permissions.`,
			});
		}

		const permissionsObject = Object.fromEntries(permissions.map((e) => [e, true]));

		const apiTokenDocument: APITokenDocument = {
			identifier,
			permissions: permissionsObject,
			token: Random20Hex(),
			userID: user.id,
			fromAPIClient,
		};

		await db["api-tokens"].insert(apiTokenDocument);

		logger.info(`Inserted new API Key for ${FormatUserDoc(user)}.`);

		return res.status(200).json({
			success: true,
			description: `Successfully created new API Token.`,
			body: apiTokenDocument,
		});
	}
);

export default router;

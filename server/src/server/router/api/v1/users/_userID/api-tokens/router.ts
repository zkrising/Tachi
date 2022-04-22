import { Router } from "express";
import db from "external/mongo/db";
import { SYMBOL_TachiData } from "lib/constants/tachi";
import CreateLogCtx from "lib/logger/logger";
import p from "prudence";
import prValidate from "server/middleware/prudence-validate";
import { ALL_PERMISSIONS, APIPermissions, APITokenDocument } from "tachi-common";
import { Random20Hex } from "utils/misc";
import { FormatUserDoc } from "utils/user";
import { RequireSelfRequestFromUser } from "../middleware";

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
	const user = req[SYMBOL_TachiData]!.requestedUser!;

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
		if (req.body.clientID && req.body.permissions) {
			return res.status(400).json({
				success: false,
				description: `Cannot use ClientID creation and permissions creation at the same time!`,
			});
		}

		let permissions: APIPermissions[];

		const user = req[SYMBOL_TachiData]!.requestedUser!;

		let identifier: string;
		let fromAPIClient = null;

		if (req.body.clientID) {
			const client = await db["api-clients"].findOne(
				{
					clientID: req.body.clientID,
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
		} else if (req.body.permissions) {
			permissions = req.body.permissions;
			identifier = req.body.identifier ?? "Custom Token";

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

/**
 * Delete this token.
 *
 * @name DELETE /api/v1/users/:userID/api-token/:token
 */
router.delete("/:token", async (req, res) => {
	const user = req[SYMBOL_TachiData]!.requestedUser!;

	logger.info(
		`received request from ${FormatUserDoc(user)} to delete token ${req.params.token}.`
	);

	const token = await db["api-tokens"].findOne({
		token: req.params.token,
		userID: user.id,
	});

	if (!token) {
		return res.status(404).json({
			success: false,
			description: `This key does not exist.`,
		});
	}

	await db["api-tokens"].remove({ token: req.params.token });

	logger.info(`Deleted ${req.params.token}, which belonged to ${FormatUserDoc(user)}.`);

	return res.status(200).json({
		success: true,
		description: `Removed Token.`,
		body: {},
	});
});

export default router;

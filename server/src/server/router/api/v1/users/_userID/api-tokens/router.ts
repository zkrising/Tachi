import { Router } from "express";
import db from "external/mongo/db";
import { SYMBOL_TachiData } from "lib/constants/tachi";
import CreateLogCtx from "lib/logger/logger";
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
 * Delete this token.
 *
 * @name DELETE /api/v1/users/:userID/api-token
 */
router.delete("/:token", async (req, res) => {
	const user = req[SYMBOL_TachiData]!.requestedUser!;

	logger.info(
		`Recieved request from ${FormatUserDoc(user)} to delete token ${req.params.token}.`
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

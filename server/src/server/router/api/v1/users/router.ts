import { Router } from "express";
import db from "../../../../../external/mongo/db";
import { SearchUsersRegExp } from "../../../../../lib/search/search";
import { IsString } from "../../../../../utils/misc";
import { GetOnlineCutoff, OMIT_PRIVATE_USER_RETURNS } from "../../../../../utils/user";
import userIDRouter from "./_userID/router";

const router: Router = Router({ mergeParams: true });

/**
 * Search users.
 *
 * @param online - Restrict returned users to those who are online.
 * @param search - Search for users where their name contains this string. If not present, returns
 * users sorted by last appearance.
 *
 * @name GET /api/v1/users
 */
router.get("/", async (req, res) => {
	const onlyOnline = !!req.query.online;

	let users;

	if (req.query.search) {
		if (!IsString(req.query.search)) {
			return res.status(400).json({
				success: false,
				description: `Search parameter was invalid.`,
			});
		}
		users = await SearchUsersRegExp(req.query.search!, onlyOnline);
	} else {
		const query = onlyOnline ? { lastSeen: { $gt: GetOnlineCutoff() } } : {};

		users = await db.users.find(query, {
			sort: { lastSeen: -1 },
			limit: 100,
			projection: OMIT_PRIVATE_USER_RETURNS,
		});
	}

	return res.status(200).json({
		success: true,
		description: `Returned ${users.length} users.`,
		body: users,
	});
});

router.use("/:userID", userIDRouter);

export default router;

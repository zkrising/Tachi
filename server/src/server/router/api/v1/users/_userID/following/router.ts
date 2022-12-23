import { RequireSelfRequestFromUser } from "../middleware";
import { Router } from "express";
import db from "external/mongo/db";
import CreateLogCtx from "lib/logger/logger";
import { ServerConfig } from "lib/setup/config";
import { p } from "prudence";
import prValidate from "server/middleware/prudence-validate";
import { GetUser } from "utils/req-tachi-data";
import { FormatUserDoc, GetUsersWithIDs, GetUserWithID } from "utils/user";
import type { integer } from "tachi-common";

const router: Router = Router({ mergeParams: true });

const logger = CreateLogCtx(__filename);

/**
 * Retrieve who this user is following.
 *
 * @note Following a user means you get updates from them in your global activity feed.
 *
 * @name GET /api/v1/users/:userID/following
 */
router.get("/", async (req, res) => {
	const user = GetUser(req);

	const settings = await db["user-settings"].findOne({ userID: user.id });

	if (!settings) {
		logger.error(`User ${FormatUserDoc(user)} has no settings?`, { user });

		return res.status(500).json({
			success: false,
			description: `This user has no settings.`,
		});
	}

	const friends = await GetUsersWithIDs(settings.following);

	return res.status(200).json({
		success: true,
		description: `Found ${friends.length} friend${friends.length !== 1 ? "s" : ""}.`,
		body: {
			friends,
		},
	});
});

/**
 * Follow a new user.
 *
 * @param userID - The user to follow.
 *
 * @name POST /api/v1/users/:userID/following/add
 */
router.post(
	"/add",
	RequireSelfRequestFromUser,
	prValidate({ userID: p.isPositiveInteger }),
	async (req, res) => {
		const user = GetUser(req);

		const { userID: toFollow } = req.safeBody as { userID: integer };

		if (user.id === toFollow) {
			return res.status(400).json({
				success: false,
				description: `Can't follow yourself. Bit self-indulgent!`,
			});
		}

		const settings = await db["user-settings"].findOne({ userID: user.id });

		if (!settings) {
			logger.error(`User ${FormatUserDoc(user)} has no settings?`, { user });

			return res.status(500).json({
				success: false,
				description: `This user has no settings.`,
			});
		}

		if (settings.following.includes(toFollow)) {
			return res.status(409).json({
				success: false,
				description: `You are already following this user.`,
			});
		}

		if (settings.following.length >= ServerConfig.MAX_FOLLOWING_AMOUNT) {
			return res.status(400).json({
				success: false,
				description: `You are following too many people. The max is ${ServerConfig.MAX_FOLLOWING_AMOUNT}.`,
			});
		}

		const userToFollow = await GetUserWithID(toFollow);

		if (!userToFollow) {
			return res.status(400).json({
				success: false,
				description: `No user with the id '${toFollow}' exists.`,
			});
		}

		// Instead of using $push in mongodb, we create a new array and set that.
		// due to the above guard, it's not possible for this to ever result
		// in a race condition.
		const following = [...settings.following, toFollow];

		await db["user-settings"].update(
			{
				userID: user.id,
			},
			{
				$set: {
					following,
				},
			}
		);

		return res.status(200).json({
			success: true,
			description: `Added ${userToFollow.username}.`,
			body: {},
		});
	}
);

/**
 * Unfollow a user.
 *
 * @param userID - The user to unfollow.
 *
 * @name POST /api/v1/users/:userID/following/remove
 */
router.post(
	"/remove",
	RequireSelfRequestFromUser,
	prValidate({ userID: p.isPositiveInteger }),
	async (req, res) => {
		const user = GetUser(req);

		const { userID: toFollow } = req.safeBody as { userID: integer };

		const settings = await db["user-settings"].findOne({ userID: user.id });

		if (!settings) {
			logger.error(`User ${FormatUserDoc(user)} has no settings?`, { user });

			return res.status(500).json({
				success: false,
				description: `This user has no settings.`,
			});
		}

		if (!settings.following.includes(toFollow)) {
			return res.status(409).json({
				success: false,
				description: `You are not following this user.`,
			});
		}

		const userToFollow = await GetUserWithID(toFollow);

		if (!userToFollow) {
			return res.status(400).json({
				success: false,
				description: `No user with the id '${toFollow}' exists.`,
			});
		}

		// Instead of using $pull in mongodb, we create a new array and set that.
		// due to the above guard, it's not possible for this to ever result
		// in a race condition.
		const following = settings.following.filter((e) => e !== toFollow);

		await db["user-settings"].update(
			{
				userID: user.id,
			},
			{
				$set: {
					following,
				},
			}
		);

		return res.status(200).json({
			success: true,
			description: `Unfollowed ${userToFollow.username}.`,
			body: {},
		});
	}
);

export default router;

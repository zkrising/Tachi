import { Router } from "express";
import db from "external/mongo/db";
import { SYMBOL_TachiData } from "lib/constants/tachi";
import { ONE_MONTH } from "lib/constants/time";
import CreateLogCtx from "lib/logger/logger";
import p from "prudence";
import prValidate from "server/middleware/prudence-validate";
import { ImportTypes, integer, UserGameStats } from "tachi-common";
import { DeleteUndefinedProps, StripUrl } from "utils/misc";
import { optNullFluffStrField } from "utils/prudence";
import {
	GetGoalSummary,
	GetRecentlyViewedFoldersAnyGPT,
	GetRecentPlaycount,
	GetRecentSessions,
} from "utils/queries/summary";
import { FormatUserDoc, GetAllRankings, GetUserWithID } from "utils/user";
import { HashPassword, PasswordCompare, ValidatePassword } from "../../auth/auth";
import apiTokensRouter from "./api-tokens/router";
import bannerRouter from "./banner/router";
import gamePTRouter from "./games/_game/_playtype/router";
import integrationsRouter from "./integrations/router";
import invitesRouter from "./invites/router";
import { GetUserFromParam, RequireSelfRequestFromUser } from "./middleware";
import pfpRouter from "./pfp/router";
import settingsRouter from "./settings/router";
import importsRouter from "./imports/router";

const logger = CreateLogCtx(__filename);

const router: Router = Router({ mergeParams: true });

router.use(GetUserFromParam);

/**
 * Get the user at this ID or name.
 * @name GET /api/v1/users/:userID
 */
router.get("/", (req, res) => {
	const user = req[SYMBOL_TachiData]!.requestedUser!;

	return res.status(200).json({
		success: true,
		description: `Found user ${user.username}.`,
		body: user,
	});
});

interface UserPatchBody {
	about?: string | null;
	status?: string | null;
	discord?: string | null;
	twitter?: string | null;
	twitch?: string | null;
	youtube?: string | null;
	github?: string | null;
	steam?: string | null;
}

/**
 * Modify this user document. All parameters are optional.
 *
 * @param about - An about me, this is rendered as markdown.
 * @param status - A user status. This is not rendered as markdown, and is short.
 * @param discord - The user's discord tag.
 * @param twitter - The user's twitter tag.
 * @param github - The user's github.
 * @param steam - The user's steamID.
 * @param youtube - The user's youtube.
 * @param twitch - The user's twitch.
 *
 * @name PATCH /api/v1/users/:userID
 */
router.patch(
	"/",
	RequireSelfRequestFromUser,
	prValidate({
		about: p.optional(p.isBoundedString(3, 2000)),
		status: optNullFluffStrField,
		discord: optNullFluffStrField,
		twitter: optNullFluffStrField,
		github: optNullFluffStrField,
		steam: optNullFluffStrField,
		youtube: optNullFluffStrField,
		twitch: optNullFluffStrField,
	}),
	async (req, res) => {
		const user = req[SYMBOL_TachiData]!.requestedUser!;

		if (Object.keys(req.body).length === 0) {
			return res.status(400).json({
				success: false,
				description: `Nothing was provided to modify.`,
			});
		}

		const body: UserPatchBody = req.body;

		// Hack stuff for user experience.
		// In kt1, users would repeatedly mess up these fields.
		if (body.twitter) {
			body.twitter = StripUrl("twitter.com/", body.twitter);
		}
		if (body.github) {
			body.github = StripUrl("github.com/", body.github);
		}
		if (body.youtube) {
			// youtube has two user urls lol
			body.youtube = StripUrl("youtube.com/user/", body.youtube);
			body.youtube = StripUrl("youtube.com/channel/", body.youtube);
		}
		if (body.twitch) {
			body.twitch = StripUrl("twitch.tv/", body.twitch);
		}
		if (body.steam) {
			body.steam = StripUrl("steamcommunity.com/id/", body.steam);
		}

		if (body.about === null) {
			return res.status(400).json({
				success: false,
				description: `Cannot set about me to null.`,
			});
		}

		// :(
		const modifyObject: Partial<
			Record<
				| `socialMedia.${"twitch" | "github" | "youtube" | "steam" | "twitter" | "discord"}`
				| "status",
				string | null
			> & { about: string }
		> = {
			about: body.about,
			status: body.status,
		};

		for (const socMed of [
			"twitch",
			"github",
			"youtube",
			"steam",
			"twitter",
			"discord",
		] as const) {
			modifyObject[`socialMedia.${socMed}` as const] = body[socMed];
		}

		DeleteUndefinedProps(modifyObject);

		await db.users.update(
			{
				id: user.id,
			},
			{
				$set: modifyObject,
			}
		);

		const newUser = await GetUserWithID(user.id);

		if (!newUser) {
			logger.severe(
				`User ${FormatUserDoc(user)} updated profile but user doc no longer exists?`,
				{ user }
			);

			return res.status(500).json({
				success: false,
				description: `An internal error has occured.`,
			});
		}

		if (req.session.tachi?.user) {
			req.session.tachi.user = newUser;
		}

		return res.status(200).json({
			success: true,
			description: `Successfully updated user.`,
			body: newUser,
		});
	}
);

/**
 * Returns all of the game-stats this user has.
 * Additionally, adds a __rankingData property, which contains this users
 * ranking information.
 * This endpoint doubles up as a way of checking what games a user has played.
 *
 * @name GET /api/v1/users/:userID/game-stats
 */
router.get("/game-stats", async (req, res) => {
	const user = req[SYMBOL_TachiData]!.requestedUser!;

	// a user has played a game if and only if they have stats for it.
	const stats: (UserGameStats & { __rankingData?: { outOf: number; ranking: number } })[] =
		await db["game-stats"].find({ userID: user.id });

	await Promise.all(
		stats.map(async (s) => {
			const data = await GetAllRankings(s);
			s.__rankingData = data;
		})
	);

	return res.status(200).json({
		success: true,
		description: `Returned ${stats.length} stats objects.`,
		body: stats,
	});
});

/**
 * Returns a summary of what the user has achieved in the past 16 hours.
 * Used on the main dashboard page to give users quick links to sessions,
 * alongside other information.
 *
 * @name GET /api/v1/users/:userID/recent-summary
 */
router.get("/recent-summary", async (req, res) => {
	const user = req[SYMBOL_TachiData]!.requestedUser!;

	const [
		recentPlaycount,
		recentSessions,
		{ folders: recentFolders, stats: recentFolderStats },
		{ achievedGoals, goals, improvedGoals },
	] = await Promise.all([
		GetRecentPlaycount(user.id),
		GetRecentSessions(user.id),
		GetRecentlyViewedFoldersAnyGPT(user.id),
		GetGoalSummary(user.id),
	]);

	return res.status(200).json({
		success: true,
		description: `Retrieved information about ${FormatUserDoc(user)}.`,
		body: {
			recentPlaycount,
			recentSessions,
			recentFolders,
			recentFolderStats,
			recentAchievedGoals: achievedGoals,
			recentGoals: goals,
			recentImprovedGoals: improvedGoals,
		},
	});
});

/**
 * Returns whether the user has verified their email or not.
 * Requires self-key level permissions.
 *
 * @name GET /api/v1/users/:userID/is-email-verified
 */
router.get("/is-email-verified", RequireSelfRequestFromUser, async (req, res) => {
	const user = req[SYMBOL_TachiData]!.requestedUser!;

	const verifyInfo = await db["verify-email-codes"].findOne({
		userID: user.id,
	});

	if (verifyInfo) {
		return res.status(200).json({
			success: true,
			description: `User has not verified email.`,
			body: false,
		});
	}

	return res.status(200).json({
		success: true,
		description: `User has verified email.`,
		body: true,
	});
});

/**
 * Changes the users password.
 * Requires self-key level permissions.
 *
 * @param !password - The new password. Must pass password validation rules.
 * @param !oldPassword - The old password.
 *
 * @name POST /api/v1/users/:userID/change-password
 */
router.post(
	"/change-password",
	RequireSelfRequestFromUser,
	prValidate({
		"!password": ValidatePassword,
		"!oldPassword": ValidatePassword,
	}),
	async (req, res) => {
		const user = req.session.tachi?.user;

		/* istanbul ignore next */
		if (!user) {
			logger.severe(
				`IP ${req.ip} got to /change-password without a user, but passed RequireSelfRequest?`
			);
			// this should be a 500, but lie to them.
			return res.status(403).json({
				success: false,
				description: `You are not authorised to perform this action.`,
			});
		}

		const privateInfo = await db["user-private-information"].findOne({
			userID: user.id,
		});

		/* istanbul ignore next */
		if (!privateInfo) {
			logger.severe(`User ${FormatUserDoc(user)} has no private information?`, { user });
			return res.status(500).json({
				success: false,
				description: `An internal server error has occured.`,
			});
		}

		const isLastPasswordValid = await PasswordCompare(
			req.body["!oldPassword"],
			privateInfo.password
		);

		if (!isLastPasswordValid) {
			return res.status(401).json({
				success: false,
				description: `Old Password doesn't match what we have in our records.`,
			});
		}

		const newPasswordHash = await HashPassword(req.body["!password"]);

		await db["user-private-information"].update(
			{
				userID: user.id,
			},
			{
				$set: {
					password: newPasswordHash,
				},
			}
		);

		return res.status(200).json({
			success: true,
			description: `Updated Password.`,
			body: {},
		});
	}
);

/**
 * Get the recent import types this user has used.
 */
router.get("/recent-imports", async (req, res) => {
	const user = req[SYMBOL_TachiData]!.requestedUser!;

	const recentImports = (await db.imports.aggregate([
		{
			$match: {
				userID: user.id,
				timeFinished: { $gt: Date.now() - ONE_MONTH },
				userIntent: true,
			},
		},
		{
			$group: {
				_id: "$importType",
				count: { $sum: 1 },
			},
		},
	])) as { _id: ImportTypes; count: integer }[];

	// rename _id to importType.
	const imports = recentImports.map((e) => ({ importType: e._id, count: e.count }));

	return res.status(200).json({
		success: true,
		description: `Found ${recentImports.length} imports.`,
		body: imports.sort((a, b) => b.count - a.count),
	});
});

router.use("/games/:game/:playtype", gamePTRouter);
router.use("/pfp", pfpRouter);
router.use("/banner", bannerRouter);
router.use("/integrations", integrationsRouter);
router.use("/settings", settingsRouter);
router.use("/api-tokens", apiTokensRouter);
router.use("/invites", invitesRouter);
router.use("/imports", importsRouter);

export default router;

import { Router } from "express";
import db from "external/mongo/db";
import { SYMBOL_TachiData } from "lib/constants/tachi";
import { GetUserFromParam, RequireAuthedAsUser } from "./middleware";
import gamePTRouter from "./games/_game/_playtype/router";
import bannerRouter from "./banner/router";
import pfpRouter from "./pfp/router";
import integrationsRouter from "./integrations/router";
import prValidate from "server/middleware/prudence-validate";
import p from "prudence";
import { optNull, optNullFluffStrField } from "utils/prudence";
import { DeleteUndefinedProps, StripUrl } from "utils/misc";
import { RequirePermissions } from "server/middleware/auth";
import { GetUserWithID } from "utils/user";

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
	RequireAuthedAsUser,
	RequirePermissions("customise_profile"),
	prValidate({
		about: optNull(p.isBoundedString(3, 2000)),
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

		// :(
		const modifyObject: any = {
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
			modifyObject[`socialMedia.${socMed}`] = body[socMed];
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

		return res.status(200).json({
			success: true,
			description: `Successfully updated user.`,
			body: newUser,
		});
	}
);

/**
 * Returns all of the game-stats this user has.
 * This endpoint doubles up as a way of checking what games a user has played.
 *
 * @name GET /api/v1/users/:userID/game-stats
 */
router.get("/game-stats", async (req, res) => {
	const user = req[SYMBOL_TachiData]!.requestedUser!;

	// a user has played a game if and only if they have stats for it.
	const stats = await db["game-stats"].find({ userID: user.id });

	return res.status(200).json({
		success: true,
		description: `Returned ${stats.length} stats objects.`,
		body: stats,
	});
});

router.use("/games/:game/:playtype", gamePTRouter);
router.use("/pfp", pfpRouter);
router.use("/banner", bannerRouter);
router.use("/integrations", integrationsRouter);

export default router;

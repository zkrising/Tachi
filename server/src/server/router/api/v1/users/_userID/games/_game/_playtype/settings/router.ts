import { RequireAuthedAsUser } from "../../../../middleware";
import { Router } from "express";
import db from "external/mongo/db";
import CreateLogCtx from "lib/logger/logger";
import p from "prudence";
import { RequirePermissions } from "server/middleware/auth";
import { GetGamePTConfig } from "tachi-common";
import { PR_GAMESPECIFIC_SETTINGS } from "tachi-common/lib/schemas";
import { FormatPrError, optNull } from "utils/prudence";
import { GetUGPT } from "utils/req-tachi-data";
import { FormatUserDoc } from "utils/user";
import type { UGPTSettings } from "tachi-common";

const logger = CreateLogCtx(__filename);

const router: Router = Router({ mergeParams: true });

/**
 * Update your settings.
 *
 * @param - See the prudence validation.
 *
 * @name PATCH /api/v1/users/:userID/games/:game/:playtype/settings
 */
router.patch(
	"/",
	RequireAuthedAsUser,
	RequirePermissions("customise_profile"),
	async (req, res) => {
		const { user, game, playtype } = GetUGPT(req);

		const gptConfig = GetGamePTConfig(game, playtype);

		const gameSpecificSchema = PR_GAMESPECIFIC_SETTINGS(game);

		const err = p(req.safeBody, {
			preferredScoreAlg: p.optional(p.nullable(p.isIn(gptConfig.scoreRatingAlgs))),
			preferredSessionAlg: p.optional(p.nullable(p.isIn(gptConfig.sessionRatingAlgs))),
			preferredProfileAlg: p.optional(p.nullable(p.isIn(gptConfig.profileRatingAlgs))),
			defaultTable: "*?string",

			// This is handled with game-specific schema validation below.
			gameSpecific: optNull(gameSpecificSchema),
			scoreBucket: optNull(p.isIn("grade", "lamp")),
		});

		if (err) {
			return res.status(400).json({
				success: false,
				description: FormatPrError(err, "Invalid game-settings."),
			});
		}

		const body = req.safeBody as Partial<UGPTSettings["preferences"]>;

		if (typeof body.defaultTable === "string") {
			const table = await db.tables.findOne({
				game,
				playtype,
				tableID: body.defaultTable,
			});

			if (!table) {
				return res.status(400).json({
					success: false,
					description: `The table (${body.defaultTable}) does not exist (and therefore cannot be set as a default).`,
				});
			}
		}

		const updateQuery: Record<string, string | null> = {};

		// @warning Slightly icky dynamic prop assignment instead of copypasta.
		for (const key of ["Score", "Session", "Profile"] as const) {
			const k = `preferred${key}Alg` as const;

			const value = body[k];

			if (value !== undefined) {
				updateQuery[`preferences.${k}`] = value;
			}
		}

		if (body.scoreBucket !== undefined) {
			updateQuery[`preferences.scoreBucket`] = body.scoreBucket;
		}

		if (body.defaultTable !== undefined) {
			updateQuery[`preferences.defaultTable`] = body.defaultTable;
		}

		if (body.gameSpecific) {
			for (const [key, value] of Object.entries(body.gameSpecific)) {
				// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
				updateQuery[`preferences.gameSpecific.${key}`] = value;
			}
		}

		if (Object.keys(updateQuery).length === 0) {
			const settings = await db["game-settings"].findOne({
				userID: user.id,
				game,
				playtype,
			});

			return res.status(200).json({
				success: true,
				description: `Nothing has been modified, successfully.`,
				body: settings,
			});
		}

		await db["game-settings"].update(
			{
				userID: user.id,
				game,
				playtype,
			},
			{
				$set: updateQuery,
			}
		);

		const settings = await db["game-settings"].findOne({
			userID: user.id,
			game,
			playtype,
		});

		if (!settings) {
			logger.error(
				`User ${FormatUserDoc(
					user
				)} has no game-settings, but has played ${game} ${playtype}?`
			);

			return res.status(500).json({
				success: false,
				description: `An internal error has occured. Do not repeat this request.`,
			});
		}

		return res.status(200).json({
			success: true,
			description: `Updated settings.`,
			body: settings,
		});
	}
);

/**
 * Returns this user's settings.
 *
 * @name GET /api/v1/users/:userID/games/:game/:playtype/settings
 */
router.get("/", async (req, res) => {
	const { user, game, playtype } = GetUGPT(req);

	const settings = await db["game-settings"].findOne({
		userID: user.id,
		game,
		playtype,
	});

	return res.status(200).json({
		success: true,
		description: `Returned ${FormatUserDoc(user)}'s settings.`,
		body: settings,
	});
});

export default router;

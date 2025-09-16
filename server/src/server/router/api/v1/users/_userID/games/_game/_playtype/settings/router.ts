import { RequireAuthedAsUser } from "../../../../middleware";
import { Router } from "express";
import db from "external/mongo/db";
import CreateLogCtx from "lib/logger/logger";
import { p } from "prudence";
import { RequirePermissions } from "server/middleware/auth";
import { GetGamePTConfig, GetScoreMetrics, PrudenceZodShim } from "tachi-common";
import { FormatPrError, optNull } from "utils/prudence";
import { GetUGPT } from "utils/req-tachi-data";
import { FormatUserDoc } from "utils/user";
import type { UGPTSettingsDocument } from "tachi-common";

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

		const gameSpecificSchema = PrudenceZodShim(gptConfig.preferences);

		const err = p(req.safeBody, {
			preferredScoreAlg: p.optional(
				p.nullable(p.isIn(Object.keys(gptConfig.scoreRatingAlgs)))
			),
			preferredSessionAlg: p.optional(
				p.nullable(p.isIn(Object.keys(gptConfig.sessionRatingAlgs)))
			),
			preferredProfileAlg: p.optional(
				p.nullable(p.isIn(Object.keys(gptConfig.profileRatingAlgs)))
			),
			defaultTable: "*?string",
			preferredRanking: optNull(p.isIn("global", "rival")),

			gameSpecific: optNull(gameSpecificSchema),
			preferredDefaultEnum: optNull(p.isIn(...GetScoreMetrics(gptConfig, "ENUM"))),
		});

		if (err) {
			return res.status(400).json({
				success: false,
				description: FormatPrError(err, "Invalid game-settings."),
			});
		}

		const body = req.safeBody as Partial<UGPTSettingsDocument["preferences"]>;

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

		if (body.preferredDefaultEnum !== undefined) {
			updateQuery[`preferences.preferredDefaultEnum`] = body.preferredDefaultEnum;
		}

		if (body.defaultTable !== undefined) {
			updateQuery[`preferences.defaultTable`] = body.defaultTable;
		}

		if (body.preferredRanking !== undefined) {
			updateQuery[`preferences.preferredRanking`] = body.preferredRanking;
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

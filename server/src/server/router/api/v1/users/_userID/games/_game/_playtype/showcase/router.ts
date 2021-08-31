import { Router } from "express";
import { SYMBOL_TachiData } from "lib/constants/tachi";
import { EvaluateUsersStatsShowcase } from "lib/showcase/get-stats";
import { ResolveUser } from "utils/user";
import p from "prudence";
import { FormatPrError } from "utils/prudence";
import { ShowcaseStatDetails, GetGamePTConfig } from "tachi-common";
import { EvaluateShowcaseStat } from "lib/showcase/evaluator";
import db from "external/mongo/db";
import { RequirePermissions } from "server/middleware/auth";
import { RequireAuthedAsUser } from "server/router/api/v1/users/_userID/middleware";
import { GetRelatedStatDocuments } from "lib/showcase/get-related";
const router: Router = Router({ mergeParams: true });

/**
 * Evaluate this users set stats.
 *
 * @param projectUser - Project another user's stats instead of their set stats.
 *
 * @name GET /api/v1/users/:userID/games/:game/:playtype/showcase
 */
router.get("/", async (req, res) => {
	const user = req[SYMBOL_TachiData]!.requestedUser!;
	const game = req[SYMBOL_TachiData]!.game!;
	const playtype = req[SYMBOL_TachiData]!.playtype!;

	let projectUser;

	if (typeof req.query.projectUser === "string") {
		const user = await ResolveUser(req.query.projectUser);

		if (!user) {
			return res.status(404).json({
				success: false,
				description: `The projected user ${req.query.projectUser} does not exist.`,
			});
		}

		projectUser = user.id;
	}

	const results = await EvaluateUsersStatsShowcase(user.id, game, playtype, projectUser);

	return res.status(200).json({
		success: true,
		description: `Evaluated ${results.length} stats.`,
		body: results,
	});
});

/**
 * Evalulate a custom stat on this user.
 *
 * @param mode - "folder" or "chart"
 * @param property - "grade" | "lamp" | "score" | "percent" and "playcount" if mode is chart.
 * @param chartID - If mode is "chart" this must contain the chartID the stat is referencing.
 * @param folderID - If mode is "folder" this must contain the folderID the stat is referencing.
 * @param gte - If mode is "folder" this must contain the value the property must be greater than.
 *
 * @name GET /api/v1/users/:userID/games/:game/:playtype/showcase/custom
 */
router.get("/custom", async (req, res) => {
	const user = req[SYMBOL_TachiData]!.requestedUser!;
	const game = req[SYMBOL_TachiData]!.game!;
	const playtype = req[SYMBOL_TachiData]!.playtype!;

	let stat: ShowcaseStatDetails;

	if (req.query.mode === "folder") {
		const err = p(
			req.query,
			{
				mode: p.is("folder"),
				property: p.isIn("grade", "lamp", "score", "percent"),
				folderID: "string",
				// lazy regex for matching strings that look like numbers
				gte: p.regex(/^[0-9]*(.[0-9])?$/u),
			},
			{},
			{ allowExcessKeys: true }
		);

		if (err) {
			return res.status(400).json({
				success: false,
				description: FormatPrError(err, "Invalid folder stat"),
			});
		}

		const folderIDs = (req.query.folderID as string).split(",");

		const folders = await db.folders.find({ folderID: { $in: folderIDs } });

		if (
			folders.length !== folderIDs.length ||
			!folders.every((r) => r.game === game && r.playtype === playtype)
		) {
			return res.status(400).json({
				success: false,
				description: `Invalid folderID - all folders must be for this game, and exist.`,
			});
		}

		stat = {
			mode: "folder",
			property: req.query.property as "grade" | "lamp" | "score" | "percent",
			folderID: folderIDs.length === 1 ? (req.query.folderID as string) : folderIDs,
			gte: Number(req.query.gte),
		};
	} else if (req.query.mode === "chart") {
		const err = p(
			req.query,
			{
				mode: p.is("chart"),
				property: p.isIn("grade", "lamp", "score", "percent", "playcount"),
				chartID: "string",
			},
			{},
			{ allowExcessKeys: true }
		);

		if (err) {
			return res.status(400).json({
				success: false,
				description: FormatPrError(err, "Invalid chart stat"),
			});
		}

		const chart = await db.charts[game].findOne({ chartID: req.query.chartID as string });

		if (!chart || chart.playtype !== playtype) {
			return res.status(400).json({
				success: false,
				description: `Chart does not exist, or is not for this game and playtype.`,
			});
		}

		stat = {
			mode: "chart",
			property: req.query.property as "grade" | "lamp" | "score" | "percent" | "playcount",
			chartID: req.query.chartID as string,
		};
	} else {
		return res.status(400).json({
			success: false,
			description: `Invalid stat mode - expected either 'chart' or 'folder'.`,
		});
	}

	const result = await EvaluateShowcaseStat(stat, user.id);

	const related = await GetRelatedStatDocuments(stat, game);

	return res.status(200).json({
		success: true,
		description: `Evaluated Stat for ${user.username}`,
		body: { stat, result, related },
	});
});

/**
 * Replaces a user's stat showcase.
 *
 * @name PUT /api/v1/users/:userID/games/:game/:playtype/showcase
 */

router.put("/", RequireAuthedAsUser, RequirePermissions("customise_profile"), async (req, res) => {
	const user = req[SYMBOL_TachiData]!.requestedUser!;
	const game = req[SYMBOL_TachiData]!.game!;
	const playtype = req[SYMBOL_TachiData]!.playtype!;

	const gptConfig = GetGamePTConfig(game, playtype);

	if (!Array.isArray(req.body)) {
		return res.status(400).json({
			success: false,
			description: `No stats provided, or was not an array.`,
		});
	}

	if (req.body.length > 6) {
		return res.status(400).json({
			success: false,
			description: `You are only allowed 6 stats at once.`,
		});
	}

	for (const stat of req.body) {
		let err;
		if (stat?.mode === "chart") {
			err = p(stat, {
				chartID: "string",
				mode: p.is("chart"),
				property: p.isIn("grade", "lamp", "score", "percent", "playcount"),
			});
		} else if (stat?.mode === "folder") {
			err = p(stat, {
				folderID: (self) => {
					if (typeof self === "string") {
						return true;
					} else if (Array.isArray(self)) {
						return self.length <= 6 && self.every((r) => typeof r === "string");
					}

					return false;
				},
				mode: p.is("folder"),
				property: p.isIn("grade", "lamp", "score", "percent"),
				// @ts-expect-error todo: investigate this weird prudence typeerror
				gte: (self, parent) => {
					if (typeof self !== "number") {
						return "Expected a number.";
					}

					if (parent.property === "grade") {
						return !!gptConfig.grades[self];
					} else if (parent.property === "lamp") {
						return !!gptConfig.lamps[self];
					} else if (parent.property === "score") {
						return p.isPositive(self);
					} else if (parent.property === "percent") {
						return p.isBetween(0, gptConfig.percentMax);
					}

					return `Invalid property of ${parent.property}`;
				},
			});
		} else {
			return res.status(400).json({
				success: false,
				description: `Invalid stat - Expected ${stat?.mode} to be 'chart' or 'folder'.`,
			});
		}

		if (err) {
			return res.status(400).json({
				success: false,
				description: FormatPrError(err, "Invalid stat."),
			});
		}

		if (stat.mode === "chart") {
			// eslint-disable-next-line no-await-in-loop
			const chart = await db.charts[game].findOne({ chartID: stat.chartID });

			if (!chart || chart.playtype !== playtype) {
				return res.status(400).json({
					success: false,
					description: `Invalid chartID - must be a chart for this game and playtype.`,
				});
			}
		} else if (stat.mode === "folder") {
			const folderIDs = Array.isArray(stat.folderID) ? stat.folderID : [stat.folderID];

			// eslint-disable-next-line no-await-in-loop
			const folders = await db.folders.find({ folderID: { $in: folderIDs } });

			if (
				folders.length !== folderIDs.length ||
				!folders.every((r) => r.game === game && r.playtype === playtype)
			) {
				return res.status(400).json({
					success: false,
					// this error message is kinda lazy.
					description: `Invalid folderID - must be a folder for this game and playtype.`,
				});
			}
		}
	}

	await db["game-settings"].update(
		{
			userID: user.id,
			game,
			playtype,
		},
		{
			$set: {
				"preferences.stats": req.body,
			},
		}
	);

	const newSettings = await db["game-settings"].findOne({
		userID: user.id,
		game,
		playtype,
	});

	return res.status(200).json({
		success: true,
		description: `Updated stat showcase.`,
		body: newSettings,
	});
});

export default router;

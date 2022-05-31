import { Router } from "express";
import db from "external/mongo/db";
import { EvaluateShowcaseStat } from "lib/showcase/evaluator";
import { GetRelatedStatDocuments } from "lib/showcase/get-related";
import { EvaluateUsersStatsShowcase } from "lib/showcase/get-stats";
import p from "prudence";
import { RequirePermissions } from "server/middleware/auth";
import { RequireAuthedAsUser } from "server/router/api/v1/users/_userID/middleware";
import { GetGamePTConfig } from "tachi-common";
import { IsRecord } from "utils/misc";
import { FormatPrError } from "utils/prudence";
import { GetUGPT } from "utils/req-tachi-data";
import { ResolveUser } from "utils/user";
import type { ShowcaseStatDetails } from "tachi-common";

const router: Router = Router({ mergeParams: true });

/**
 * Evaluate this users set stats.
 *
 * @param projectUser - Project another user's stats instead of their set stats.
 *
 * @name GET /api/v1/users/:userID/games/:game/:playtype/showcase
 */
router.get("/", async (req, res) => {
	const { user, game, playtype } = GetUGPT(req);

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
	const { user, game, playtype } = GetUGPT(req);

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
			property: req.query.property as "grade" | "lamp" | "percent" | "score",
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
			property: req.query.property as "grade" | "lamp" | "percent" | "playcount" | "score",
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
	const { user, game, playtype } = GetUGPT(req);

	const gptConfig = GetGamePTConfig(game, playtype);

	if (!Array.isArray(req.safeBody)) {
		return res.status(400).json({
			success: false,
			description: `No stats provided, or was not an array.`,
		});
	}

	if (req.safeBody.length > 6) {
		return res.status(400).json({
			success: false,
			description: `You are only allowed 6 stats at once.`,
		});
	}

	const stats = req.safeBody as Array<unknown>;

	for (const unvalidatedStat of stats) {
		let err;

		if (!IsRecord(unvalidatedStat)) {
			return res.status(400).json({
				success: false,
				description: `Invalid stat -- got null or a non-object.`,
			});
		}

		if (unvalidatedStat.mode === "chart") {
			err = p(unvalidatedStat, {
				chartID: "string",
				mode: p.is("chart"),
				property: p.isIn("grade", "lamp", "score", "percent", "playcount"),
			});
		} else if (unvalidatedStat.mode === "folder") {
			err = p(unvalidatedStat, {
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
						return p.isBetween(0, gptConfig.percentMax)(self);
					}

					return `Invalid property of ${parent.property}`;
				},
			});
		} else {
			return res.status(400).json({
				success: false,
				description: `Invalid stat - Expected mode to be 'chart' or 'folder').`,
			});
		}

		if (err) {
			return res.status(400).json({
				success: false,
				description: FormatPrError(err, "Invalid stat."),
			});
		}

		const stat = unvalidatedStat as unknown as ShowcaseStatDetails;

		if (stat.mode === "chart") {
			// eslint-disable-next-line no-await-in-loop
			const chart = await db.charts[game].findOne({ chartID: stat.chartID });

			if (!chart || chart.playtype !== playtype) {
				return res.status(400).json({
					success: false,
					description: `Invalid chartID - must be a chart for this game and playtype.`,
				});
			}
		} else if (unvalidatedStat.mode === "folder") {
			const folderIDs = Array.isArray(unvalidatedStat.folderID)
				? unvalidatedStat.folderID
				: [unvalidatedStat.folderID];

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
				"preferences.stats": req.safeBody,
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

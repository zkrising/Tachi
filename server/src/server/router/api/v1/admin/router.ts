/* eslint-disable no-await-in-loop */
import { RequestHandler, Router } from "express";
import p from "prudence";
import { SYMBOL_TachiAPIAuth } from "lib/constants/tachi";
import CreateLogCtx, { ChangeRootLogLevel, GetLogLevel } from "lib/logger/logger";
import prValidate from "server/middleware/prudence-validate";
import { GetUserWithID } from "utils/user";
import { ONE_MINUTE } from "lib/constants/time";
import { ServerConfig, ServerTypeInfo } from "lib/setup/config";
import { Game, UserAuthLevels } from "tachi-common";

import db from "external/mongo/db";

const logger = CreateLogCtx(__filename);

const router: Router = Router({ mergeParams: true });

const RequireAdminLevel: RequestHandler = async (req, res, next) => {
	if (!req[SYMBOL_TachiAPIAuth].userID) {
		return res.status(401).json({
			success: false,
			description: `You are not authenticated.`,
		});
	}

	const userDoc = await GetUserWithID(req[SYMBOL_TachiAPIAuth].userID!);

	if (!userDoc) {
		logger.severe(
			`Api Token ${req[SYMBOL_TachiAPIAuth].token} is assigned to ${req[SYMBOL_TachiAPIAuth].userID}, who does not exist?`
		);

		return res.status(500).json({
			success: false,
			description: `An internal error has occured.`,
		});
	}

	if (userDoc.authLevel !== UserAuthLevels.ADMIN) {
		return res.status(403).json({
			success: false,
			description: `You are not authorised to perform this.`,
		});
	}

	return next();
};

const LOG_LEVEL = ServerConfig.LOG_LEVEL;

router.use(RequireAdminLevel);

let currentLogLevelTimer: NodeJS.Timeout | null = null;

/**
 * Changes the current server log level to the provided `logLevel` in the request body.
 *
 * @param logLevel - The log level to change to.
 * @param duration - The amount of minutes to wait before changing the log level back to the default.
 * Defaults to 60 minutes.
 * @param noReset - If true, do not ever reset this decision.
 *
 * @name POST /api/v1/admin/change-log-level
 */
router.post(
	"/change-log-level",
	prValidate({
		logLevel: p.isIn("crit", "severe", "error", "warn", "info", "verbose", "debug"),
		duration: p.optional(p.isPositiveNonZero),
		noReset: p.optional("boolean"),
	}),
	(req, res) => {
		const logLevel = GetLogLevel();
		ChangeRootLogLevel(req.body.logLevel);

		const duration = req.body.duration ?? 60;

		if (currentLogLevelTimer) {
			logger.verbose(`Removing last timer to reset log level to ${LOG_LEVEL}.`);
			clearTimeout(currentLogLevelTimer);
		}

		logger.info(`Log level has been changed to ${req.body.level}.`);

		if (!req.body.noReset) {
			logger.info(`This will reset to "${LOG_LEVEL}" level in ${duration} minutes.`);

			currentLogLevelTimer = setTimeout(() => {
				logger.verbose(`Changing log level back to ${LOG_LEVEL}.`);
				ChangeRootLogLevel(LOG_LEVEL);
				logger.info(`Reset log level back to ${LOG_LEVEL}.`);
			}, duration * ONE_MINUTE);
		}

		return res.status(200).json({
			success: true,
			description: `Changed log level from ${logLevel} to ${req.body.level}.`,
			body: {},
		});
	}
);

/**
 * Removes the isPrimary status from a chart, and uncalcs all of
 * its score data.
 *
 * @param chartID - the chartID to deprimarify.
 *
 * @name POST /api/v1/admin/deprimarify
 */
router.post(
	"/deprimarify",
	prValidate({
		chartID: "*string",
		game: p.isIn(ServerTypeInfo.supportedGames),
		songID: p.optional(p.isPositiveNonZeroInteger),
	}),
	async (req, res) => {
		const coll = db.charts[req.body.game as Game];

		if (!req.body.chartID && !req.body.songID) {
			return res.status(400).json({
				success: false,
				description: `Invalid request - need either chartID or songID.`,
			});
		}

		let charts = [];

		if (req.body.chartID) {
			charts.push(await coll.findOne({ chartID: req.body.chartID }));
		} else {
			charts = await coll.find({ songID: req.body.songID });
		}

		for (const chart of charts) {
			if (!chart) {
				return res.status(404).json({
					success: false,
					description: `The chart ${req.body.chartID} does not exist.`,
				});
			}

			const song = await db.songs[req.body.game as Game].findOne({
				id: chart.songID,
			});

			if (!song) {
				logger.severe(`Song-chart desync on ${chart.songID}.`);
				return res.status(500).json({
					success: false,
					description: `S-C Desync.`,
				});
			}

			logger.info(`Deprimarifying ${song.title} (${chart.chartID}).`);

			await coll.update(
				{
					chartID: req.body.chartID,
				},
				{
					$set: {
						isPrimary: false,
					},
				}
			);

			logger.info(`Emptying all calculated data for this chart.`);

			await db.scores.update(
				{ chartID: req.body.chartID },
				{
					$set: {
						calculatedData: {},
					},
				},
				{
					multi: true,
				}
			);

			await db["personal-bests"].update(
				{
					chartID: req.body.chartID,
				},
				{
					$set: {
						calculatedData: {},
					},
				},
				{
					multi: true,
				}
			);
		}

		return res.status(200).json({
			success: true,
			description: `Deprimarified.`,
			body: {
				charts,
			},
		});
	}
);

export default router;

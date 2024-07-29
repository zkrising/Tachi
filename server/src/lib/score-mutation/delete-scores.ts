/* eslint-disable no-await-in-loop */
import db from "external/mongo/db";
import CreateLogCtx from "lib/logger/logger";
import { GetAndUpdateUsersGoals } from "lib/score-import/framework/goals/goals";
import { UpdateChartRanking } from "lib/score-import/framework/pb/create-pb-doc";
import { ProcessPBs } from "lib/score-import/framework/pb/process-pbs";
import { UpdateUsersQuests } from "lib/score-import/framework/quests/quests";
import { UpdateUsersGamePlaytypeStats } from "lib/score-import/framework/ugpt-stats/update-ugpt-stats";
import { RecalcSessions } from "utils/calculations/recalc-sessions";
import type { Game, Playtype, ScoreDocument } from "tachi-common";

const logger = CreateLogCtx(__filename);

/**
 * Deletes the provided score. This needs a dedicated helper method due to
 * needing to unset things like sessions and recalcs.
 */
export async function DeleteScore(
	score: ScoreDocument,
	blacklist = false,
	attemptPBReprocess = true
) {
	await db.scores.remove({
		scoreID: score.scoreID,
	});

	const sessions = await db.sessions.find({
		scoreIDs: score.scoreID,
	});

	for (const session of sessions) {
		// If a session only has one score, then pulling it should kill
		// the session.
		if (session.scoreIDs.length === 1) {
			// eslint-disable-next-line no-await-in-loop
			await db.sessions.remove({
				sessionID: session.sessionID,
			});
		}
	}

	await db.sessions.update(
		{
			sessionID: { $in: sessions.map((e) => e.sessionID) },
		},
		{
			$pull: {
				scoreIDs: score.scoreID,
			},
		},
		{
			multi: true,
		}
	);

	await RecalcSessions({ sessionID: { $in: sessions.map((e) => e.sessionID) } });

	const importDoc = await db.imports.findOne({
		scoreIDs: score.scoreID,
	});

	if (importDoc) {
		if (importDoc.scoreIDs.length === 1) {
			await db.imports.remove({
				importID: importDoc.importID,
			});
		} else {
			await db.imports.update(
				{
					importID: importDoc.importID,
				},
				{
					$pull: {
						scoreIDs: score.scoreID,
					},
				},
				{
					multi: true,
				}
			);
		}
	}

	const userHasOtherScores = await db.scores.findOne({
		userID: score.userID,
		chartID: score.chartID,
	});

	if (userHasOtherScores && attemptPBReprocess) {
		await ProcessPBs(
			score.game,
			score.playtype,
			score.userID,
			new Set([score.chartID]),
			logger
		);
	} else {
		await db["personal-bests"].remove({
			userID: score.userID,
			chartID: score.chartID,
		});

		await UpdateChartRanking(score.game, score.playtype, score.chartID);
	}

	await UpdateUsersGamePlaytypeStats(score.game, score.playtype, score.userID, null, logger);

	if (blacklist) {
		const alreadyBlacklisted = await db["score-blacklist"].findOne({
			userID: score.userID,
			scoreID: score.scoreID,
		});

		if (!alreadyBlacklisted) {
			logger.info(`Blacklisted ${score.scoreID}.`);
			await db["score-blacklist"].insert({
				userID: score.userID,
				scoreID: score.scoreID,
				score,
			});
		}
	}
}

export async function DeleteMultipleScores(scores: Array<ScoreDocument>, blacklist = false) {
	logger.info(`Received request to delete ${scores.length} score(s) (Blacklist: ${blacklist}).`);

	const scoreIDs = scores.map((e) => e.scoreID);
	const chartIDs = scores.map((e) => e.chartID);

	await db.scores.remove({
		scoreID: { $in: scoreIDs },
	});

	const sessions = await db.sessions.find({
		scoreIDs: { $in: scoreIDs },
	});

	for (const session of sessions) {
		// If a session only has one score, then pulling it should kill
		// the session.
		if (session.scoreIDs.length === 1) {
			// eslint-disable-next-line no-await-in-loop
			await db.sessions.remove({
				sessionID: session.sessionID,
			});
		}
	}

	await db.sessions.update(
		{
			sessionID: { $in: sessions.map((e) => e.sessionID) },
		},
		{
			$pull: {
				scoreIDs: { $in: scoreIDs },
			},
		},
		{
			multi: true,
		}
	);

	// remove all sessions that no longer have scores in them.
	await db.sessions.remove({
		sessionID: { $in: sessions.map((e) => e.sessionID) },
		scoreIDs: { $size: 0 },
	});

	await RecalcSessions({ sessionID: { $in: sessions.map((e) => e.sessionID) } });

	const importDoc = await db.imports.findOne({
		scoreIDs: { $in: scoreIDs },
	});

	if (importDoc) {
		// pull all scoreIDs from this import.
		await db.imports.update(
			{
				importID: importDoc.importID,
			},
			{
				$pull: {
					scoreIDs: { $in: scoreIDs },
				},
			},
			{
				multi: true,
			}
		);

		// remove this import if no scores belong to it anymore.
		await db.imports.remove({
			importID: importDoc.importID,
			scoreIDs: { $size: 0 },
		});
	}

	for (const score of scores) {
		const userHasOtherScores = await db.scores.findOne({
			userID: score.userID,
			chartID: score.chartID,
		});

		if (userHasOtherScores) {
			await ProcessPBs(
				score.game,
				score.playtype,
				score.userID,
				new Set([score.chartID]),
				logger
			);
		} else {
			await db["personal-bests"].remove({
				userID: score.userID,
				chartID: score.chartID,
			});

			await UpdateChartRanking(score.game, score.playtype, score.chartID);
		}

		if (blacklist) {
			const alreadyBlacklisted = await db["score-blacklist"].findOne({
				userID: score.userID,
				scoreID: score.scoreID,
			});

			if (!alreadyBlacklisted) {
				logger.info(`Blacklisted ${score.scoreID}.`);
				await db["score-blacklist"].insert({
					userID: score.userID,
					scoreID: score.scoreID,
					score,
				});
			}
		}
	}

	const ugpts = [...new Set(scores.map((e) => `${e.game}-${e.playtype}-${e.userID}`))];

	for (const ugpt of ugpts) {
		const [game, playtype, strUserID] = ugpt.split("-") as [Game, Playtype, string];

		const userID = Number(strUserID);

		const pertinentChartIDs = scores
			.filter((e) => e.game === game && e.playtype === playtype && e.userID === userID)
			.map((e) => e.chartID);

		// if this user has any scores, update their goals.
		if (pertinentChartIDs.length > 0) {
			const goalInfo = await GetAndUpdateUsersGoals(game, userID, new Set(chartIDs), logger);

			await UpdateUsersQuests(goalInfo, game, [playtype], userID, logger);
		}

		await UpdateUsersGamePlaytypeStats(game, playtype, userID, null, logger);
	}

	logger.info(`Finished deleting ${scores.length} scores.`);
}

/* eslint-disable no-await-in-loop */
import db from "external/mongo/db";
import CreateLogCtx from "lib/logger/logger";
import { UpdateChartRanking } from "lib/score-import/framework/pb/create-pb-doc";
import { ProcessPBs } from "lib/score-import/framework/pb/process-pbs";
import { UpdateUsersGamePlaytypeStats } from "lib/score-import/framework/user-game-stats/update-ugs";
import { Game, Playtypes, ScoreDocument } from "tachi-common";

const logger = CreateLogCtx(__filename);

/**
 * Deletes the provided score. This needs a dedicated helper method due to
 * needing to unset things like sessions and recalcs.
 */
export async function DeleteScore(score: ScoreDocument, blacklist = false) {
	await db.scores.remove({
		scoreID: score.scoreID,
	});

	const sessions = await db.sessions.find({
		"scoreInfo.scoreID": score.scoreID,
	});

	for (const session of sessions) {
		// If a session only has one score, then pulling it should kill
		// the session.
		if (session.scoreInfo.length === 1) {
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
				scoreInfo: {
					scoreID: score.scoreID,
				},
			},
		},
		{
			multi: true,
		}
	);

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
		chart: score.chartID,
	});

	if (userHasOtherScores) {
		await ProcessPBs(score.userID, new Set([score.chartID]), logger);
	} else {
		await db["personal-bests"].remove({
			userID: score.userID,
			chartID: score.chartID,
		});

		await UpdateChartRanking(score.chartID);
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

export async function DeleteMultipleScores(scores: ScoreDocument[], blacklist = false) {
	logger.info(`Recieved request to delete ${scores.length} (Blacklist: ${blacklist}).`);

	const scoreIDs = scores.map((e) => e.scoreID);

	await db.scores.remove({
		scoreID: { $in: scoreIDs },
	});

	const sessions = await db.sessions.find({
		"scoreInfo.scoreID": { $in: scoreIDs },
	});

	for (const session of sessions) {
		// If a session only has one score, then pulling it should kill
		// the session.
		if (session.scoreInfo.length === 1) {
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
				scoreInfo: {
					scoreID: { $in: scoreIDs },
				},
			},
		},
		{
			multi: true,
		}
	);

	const importDoc = await db.imports.findOne({
		scoreIDs: { $in: scoreIDs },
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
						scoreIDs: { $in: scoreIDs },
					},
				},
				{
					multi: true,
				}
			);
		}
	}

	for (const score of scores) {
		const userHasOtherScores = await db.scores.findOne({
			userID: score.userID,
			chart: score.chartID,
		});

		if (userHasOtherScores) {
			await ProcessPBs(score.userID, new Set([score.chartID]), logger);
		} else {
			await db["personal-bests"].remove({
				userID: score.userID,
				chartID: score.chartID,
			});

			await UpdateChartRanking(score.chartID);
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
		const [game, playtype, strUserID] = ugpt.split("-") as [Game, Playtypes[Game], string];

		const userID = Number(strUserID);

		await UpdateUsersGamePlaytypeStats(game, playtype, userID, null, logger);
	}

	logger.info(`Finished deleting ${scores.length} scores.`);
}

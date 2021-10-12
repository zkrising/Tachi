import db from "external/mongo/db";
import CreateLogCtx from "lib/logger/logger";
import { ProcessPBs } from "lib/score-import/framework/pb/process-pbs";
import { UpdateUsersGamePlaytypeStats } from "lib/score-import/framework/user-game-stats/update-ugs";
import { ScoreDocument, Game, Playtypes, ImportDocument } from "tachi-common";
import { DedupeArr } from "utils/misc";

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
				}
			);
		}
	}

	// WARN: The array part is important, Set-ing a string explodes
	// it into its individual characters.
	await ProcessPBs(score.userID, new Set([score.chartID]), logger);

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

/**
 * Deletes multiple provided scores. This is a separate function for
 * performance reasons.
 *
 * This is userID and GPT agnostic.
 */
export async function DeleteMultipleScores(scores: ScoreDocument[], blacklist = false) {
	const scoreIDs = scores.map((e) => e.scoreID);

	await db.scores.remove({
		scoreID: { $in: scoreIDs },
	});

	const sessions = await db.sessions.find({
		"scoreInfo.scoreID": { $in: scoreIDs },
	});

	// We need to kill sessions that no longer own any scores.
	const killSessions = sessions.filter((e) => e.scoreInfo.length === 1);
	if (killSessions.length) {
		await db.sessions.remove({
			sessionID: { $in: killSessions.map((e) => e.sessionID) },
		});
	}

	const updateSessions = sessions.filter((e) => e.scoreInfo.length > 1);

	if (updateSessions.length) {
		await db.sessions.update(
			{
				sessionID: { $in: updateSessions.map((e) => e.sessionID) },
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
	}

	const userIDs = DedupeArr(scores.map((e) => e.userID));
	const chartIDs = new Set(scores.map((e) => e.chartID));

	const pbReprocess = userIDs.map((e) => ProcessPBs(e, chartIDs, logger));

	await Promise.all(pbReprocess);

	const ugptUpdates: Set<string> = new Set();

	// This is the easiest way to serialise this. Kinda hacky.
	for (const score of scores) {
		ugptUpdates.add(`${score.game}-${score.playtype}-${score.userID}`);
	}

	const ugptUpdatePromises = [...ugptUpdates].map((e) => {
		const [game, playtype, strUserID] = e.split("-") as [Game, Playtypes[Game], string];

		const userID = Number(strUserID);

		return UpdateUsersGamePlaytypeStats(game, playtype, userID, null, logger);
	});

	await Promise.all(ugptUpdatePromises);

	if (blacklist) {
		const alreadyBlacklisted = await db["score-blacklist"].find({
			scoreID: { $in: scoreIDs },
		});

		let docs = scores.map((e) => ({ userID: e.userID, scoreID: e.scoreID, score: e }));

		if (alreadyBlacklisted.length) {
			const xrDiff = new Set(alreadyBlacklisted.map((e) => `${e.userID}-${e.scoreID}`));

			docs = docs.filter((e) => !xrDiff.has(`${e.userID}-${e.scoreID}`));
		}

		await db["score-blacklist"].insert(docs);
	}
}

/**
 * Utility function that gets all of the scores from an import and removes
 * those scores.
 */
export async function RevertImport(importDocument: ImportDocument) {
	const scores = await db.scores.find({
		scoreID: { $in: importDocument.scoreIDs },
	});

	await DeleteMultipleScores(scores);
}

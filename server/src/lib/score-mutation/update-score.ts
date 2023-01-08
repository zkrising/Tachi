/* eslint-disable no-await-in-loop */
import db from "external/mongo/db";
import { rootLogger } from "lib/logger/logger";
import { CreateScoreCalcData } from "lib/score-import/framework/calculated-data/score";
import { UpdateChartRanking } from "lib/score-import/framework/pb/create-pb-doc";
import { CreateScoreID } from "lib/score-import/framework/score-importing/score-id";
import { GetGPTString } from "tachi-common";
import { UpdateAllPBs } from "utils/calculations/recalc-scores";
import { FormatUserDoc, GetUserWithID } from "utils/user";
import type { KtLogger } from "lib/logger/logger";
import type { ScoreDocument } from "tachi-common";

/**
 * Updates a score from oldScore to newScore, applying all necessary state
 * changes on the way.
 *
 * @note You don't need to recalc the scoreID for newScore, it's done for you.
 */
export default async function UpdateScore(
	oldScore: ScoreDocument,
	newScore: ScoreDocument,
	updateOldChart = true
) {
	const userID = oldScore.userID;
	const user = await GetUserWithID(userID);

	if (!user) {
		rootLogger.severe(
			`User ${userID} does not exist, yet a score update was called for them? Panicking.`
		);
		throw new Error(
			`User ${userID} does not exist, yet a score update was called for them? Panicking.`
		);
	}

	const chartID = newScore.chartID;

	const chart = await db.anyCharts[oldScore.game].findOne({
		chartID,
	});

	if (!chart) {
		rootLogger.severe(
			`Chart ${chartID} does not exist, yet a score update was called for it? Panicking.`
		);
		throw new Error(
			`Chart ${chartID} does not exist, yet a score update was called for it? Panicking.`
		);
	}

	// In the event that the new chart isn't under the same song as the previous one, the songID
	// needs to update.
	newScore.songID = chart.songID;

	const oldScoreID = oldScore.scoreID;

	const newScoreID = CreateScoreID(
		GetGPTString(newScore.game, newScore.playtype),
		newScore.userID,
		newScore,
		newScore.chartID
	);

	// We need to change *so* many references to score IDs, and recalculate *so*
	// much stored state. Obviously, changing a scoreID is an exceptional circumstance
	// brought on by a bug.
	// So hopefully, we wont have to use this much.

	newScore.scoreID = newScoreID;

	const logger = rootLogger.child({
		context: ["Update Score", oldScore.scoreID, newScore.scoreID, FormatUserDoc(user)],
	}) as KtLogger;

	logger.verbose("Received Update Score request.");

	// eslint-disable-next-line require-atomic-updates
	newScore.calculatedData = CreateScoreCalcData(newScore, chart);

	try {
		// Having _id defined will cause this to throw, causing it to not apply
		// the update.
		// @ts-expect-error this shouldn't happen according to types.
		if (newScore._id) {
			logger.warn(
				`Passed a score with _id to UpdateScore. This property should not be set. Deleting this property and continuing anyway.`
			);

			// @ts-expect-error this shouldn't happen according to types.
			delete newScore._id;
		}

		await db.scores.update(
			{
				scoreID: oldScoreID,
			},
			{ $set: newScore }
		);
	} catch (err) {
		logger.error(err);
		logger.warn(
			`Score ID ${newScoreID} already existed -- this update caused a collision. Removing old score and updating old references anyway.`
		);
		await db.scores.remove({
			scoreID: oldScoreID,
		});
	}

	const sessions = await db.sessions.find({
		scoreIDs: oldScoreID,
	});

	// another session already has the new score? (i.e. migrating to an already
	// existing score?)
	const existsElsewhere = await db.sessions.findOne({
		scoreIDs: newScoreID,
	});

	logger.verbose(`Updating ${sessions.length} sessions.`);

	// For every session that interacts with this score ID (there should only ever be one)
	for (const session of sessions) {
		const newScoreIDs = [];

		// Go over all the scoreIDs and alter the ones that involve this scoreID.
		for (const scoreID of session.scoreIDs) {
			if (scoreID === oldScoreID) {
				if (existsElsewhere) {
					// skip this, as this score already belongs to another session.
					continue;
				}

				if (newScore.timeAchieved === null) {
					// this shouldn't be in a session anymore.
					continue;
				}

				newScoreIDs.push(newScoreID);
			} else {
				newScoreIDs.push(scoreID);
			}
		}

		const scores = await db.scores.find({
			scoreID: { $in: newScoreIDs },
		});

		// update calculated data too.
		const newCalcData = CreateSessionCalcData(session.game, session.playtype, scores);

		await db.sessions.update(
			{
				sessionID: session.sessionID,
			},
			{
				$set: { scoreIDs: newScoreIDs, calculatedData: newCalcData },
			}
		);
	}

	logger.verbose(`Updating PBs.`);

	// Update the PBs to reference properly.
	// We run updateAllPbs on just the modified chart -- the reason
	// for this is to update ranking info incase that might fall out of
	// sync as a result.
	await UpdateAllPBs([userID], {
		chartID: newScore.chartID,
	});

	await UpdateChartRanking(newScore.game, newScore.playtype, newScore.chartID);

	if (updateOldChart) {
		await UpdateAllPBs([userID], {
			chartID: oldScore.chartID,
		});
		await UpdateChartRanking(oldScore.game, oldScore.playtype, oldScore.chartID);
	}

	const imports = await db.imports.find({
		scoreIDs: oldScoreID,
	});

	logger.verbose(`Updating ${imports.length} imports.`);

	for (const importDoc of imports) {
		await db.imports.update(
			{
				importID: importDoc.importID,
			},
			{
				$set: {
					scoreIDs: importDoc.scoreIDs.map((e) => (e === oldScoreID ? newScoreID : e)),
				},
			}
		);
	}

	logger.verbose(`Done updating score.`);
}

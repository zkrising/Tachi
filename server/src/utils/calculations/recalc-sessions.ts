/* eslint-disable no-await-in-loop */

import db from "external/mongo/db";
import CreateLogCtx from "lib/logger/logger";
import { CreateSessionCalcData } from "lib/score-import/framework/sessions/calculated-data";

const logger = CreateLogCtx(__filename);

export async function RecalcSessions(filter = {}) {
	const allSessions = await db.sessions.find(filter);

	logger.info(`Recalcing ${allSessions.length} sessions.`);

	for (const session of allSessions) {
		const scores = await db.scores.find(
			{ scoreID: { $in: session.scoreInfo.map((e) => e.scoreID) } },
			{
				projection: { calculatedData: 1 },
			}
		);

		if (scores.length === 0) {
			await db.sessions.remove({ sessionID: session.sessionID });
			continue;
		}

		let c;

		try {
			c = CreateSessionCalcData(session.game, session.playtype, scores);
		} catch (err) {
			logger.error(`Recalcing ${session.game} (${session.playtype}) failed.`, { err });
			logger.warn(`Destroying session!`);
			await db.sessions.remove({ sessionID: session.sessionID });
			continue;
		}

		await db.sessions.update({ sessionID: session.sessionID }, { $set: { calculatedData: c } });
	}

	logger.info(`Done!`);
}

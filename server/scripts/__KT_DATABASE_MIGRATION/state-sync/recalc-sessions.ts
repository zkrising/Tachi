/* eslint-disable no-await-in-loop */
import db from "external/mongo/db";
import CreateLogCtx from "lib/logger/logger";
import { ProcessPBs } from "lib/score-import/framework/pb/process-pbs";
import { FormatUserDoc } from "utils/user";
import deepmerge from "deepmerge";
import { CreateSessionCalcData } from "lib/score-import/framework/sessions/calculated-data";

const logger = CreateLogCtx(__filename);

export async function RecalcSessions() {
	const allSessions = await db.sessions.find({});
	logger.info(`Recalcing ${allSessions.length} sessions.`);

	for (const session of allSessions) {
		const scores = await db.scores.find(
			{ scoreID: { $in: session.scoreInfo.map((e) => e.scoreID) } },
			{
				projection: { calculatedData: 1 },
			}
		);

		let c;
		try {
			c = CreateSessionCalcData(session.game, session.playtype, scores);
		} catch (err) {
			logger.error(`${session.game} (${session.playtype}) failed.`);
			logger.warn(`Destroying session.`);
			await db.sessions.remove({ sessionID: session.sessionID });
			continue;
		}

		await db.sessions.update({ sessionID: session.sessionID }, { $set: { calculatedData: c } });
	}

	logger.info(`Done!`);
}

if (require.main === module) {
	RecalcSessions();
}

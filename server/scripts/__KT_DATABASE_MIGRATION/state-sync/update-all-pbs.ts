/* eslint-disable no-await-in-loop */
import db from "external/mongo/db";
import CreateLogCtx from "lib/logger/logger";
import { ProcessPBs } from "lib/score-import/framework/pb/process-pbs";
import { FormatUserDoc } from "utils/user";
import deepmerge from "deepmerge";

const logger = CreateLogCtx(__filename);

export async function UpdateAllPBs(filter = {}) {
	const allUsers = await db.users.find({});

	for (const user of allUsers) {
		logger.info(`Finding ${FormatUserDoc(user)}'s scores.`);

		const scores = await db.scores.find(deepmerge({ userID: user.id }, filter), {
			projection: { chartID: 1 },
		});

		logger.info(`PBing ${FormatUserDoc(user)}'s scores.`);
		await ProcessPBs(user.id, new Set(scores.map((e) => e.chartID)), logger);
	}

	logger.info(`Done!`);
}

if (require.main === module) {
	UpdateAllPBs();
}

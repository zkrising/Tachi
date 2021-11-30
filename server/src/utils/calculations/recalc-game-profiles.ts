/* eslint-disable no-await-in-loop */

import db from "external/mongo/db";
import CreateLogCtx from "lib/logger/logger";
import { CreateSessionCalcData } from "lib/score-import/framework/sessions/calculated-data";
import { UpdateUsersGamePlaytypeStats } from "lib/score-import/framework/user-game-stats/update-ugs";
import { FormatUserDoc } from "utils/user";

const logger = CreateLogCtx(__filename);

export async function RecalcGameProfiles(filter = {}) {
	const profiles = await db["game-stats"].find(filter);

	for (const profile of profiles) {
		const user = await db.users.findOne({
			id: profile.userID,
		});

		if (!user) {
			logger.severe(`User ${profile.userID} does not exist?`);
			throw new Error(`User ${profile.userID} does not exist.`);
		}

		logger.verbose(
			`Recalcing ${FormatUserDoc(user)}'s ${profile.game} ${profile.playtype} stats.`
		);
		await UpdateUsersGamePlaytypeStats(
			profile.game,
			profile.playtype,
			profile.userID,
			null,
			logger
		);
	}

	logger.info(`Done.`);
}

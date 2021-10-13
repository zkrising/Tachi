import { UserGameStats, UserGameStatsSnapshot } from "tachi-common";
import db from "external/mongo/db";
import CreateLogCtx from "lib/logger/logger";
import { GetUsersRanking } from "utils/user";
import { GetMilisecondsSince } from "utils/misc";

const logger = CreateLogCtx(__filename);

// get the time of this midnight. it's possible this script eclipses itself when weird timezone
// nonsense happens. we'll have to see.
const currentTime = new Date().setUTCHours(0, 0, 0, 0);

let batchWrite: UserGameStatsSnapshot[] = [];

// This code is intentionally *very* robust, and handles a lot of unanticipated failures
// because if it breaks, we brick the database.
export async function UGSSnapshot() {
	const timeStart = process.hrtime.bigint();

	const alreadyExists = await db["game-stats-snapshots"].findOne({ timestamp: currentTime });

	if (alreadyExists) {
		logger.warn(
			`There already exists snapshots at this time. Has this script been ran twice on one day? Ignoring request.`
		);

		throw new Error(
			`There already exists snapshots at this time. Has this script been ran twice on one day? Ignoring request.`
		);
	}

	logger.info(`Snapshotting UserGameStats.`);

	try {
		await db["game-stats"]
			.find({})
			// @ts-expect-error faulty TS types
			.each(async (ugs: UserGameStats, { pause, resume }) => {
				pause();

				logger.debug(`Snapshotting ${ugs.userID} ${ugs.playtype} ${ugs.game}.`);

				const [playcount, ranking] = await Promise.all([
					db.scores.count({ userID: ugs.userID, playtype: ugs.playtype, game: ugs.game }),
					GetUsersRanking(ugs),
				]);

				const ugsSnapshot: UserGameStatsSnapshot = {
					...ugs,
					playcount,
					ranking,
					timestamp: currentTime,
				};

				batchWrite.push(ugsSnapshot);

				if (batchWrite.length >= 500) {
					logger.verbose(`Flushed batch.`);
					await db["game-stats-snapshots"].insert(batchWrite);
					batchWrite = [];
				}

				resume();
			});

		if (batchWrite.length) {
			await db["game-stats-snapshots"].insert(batchWrite);
		}

		logger.info(
			`Successfully snapshotted all data as of ${new Date(
				currentTime
			).toString()}. Took ${GetMilisecondsSince(timeStart)} ms.`
		);
	} catch (err) {
		// if we panic, we need to revert whatever we did.
		logger.severe(`FATAL IN UGS-SNAPSHOT - Possibly failed midway through snapshotting.`, {
			err,
		});

		logger.info(`Removing all snapshots at this timestamp (${currentTime}).`);

		await db["game-stats-snapshots"].remove({ timestamp: currentTime });

		logger.info(`Removed.`);

		throw err;
	}
}

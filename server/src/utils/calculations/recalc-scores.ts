/* eslint-disable no-await-in-loop */
import db from "external/mongo/db";
import { Game, integer, Playtypes, PublicUserDocument } from "tachi-common";
import CreateLogCtx from "lib/logger/logger";
import { CreateCalculatedData } from "lib/score-import/framework/calculated-data/calculated-data";
import { UpdateUsersGamePlaytypeStats } from "lib/score-import/framework/user-game-stats/update-ugs";
import { GetAndUpdateUsersGoals } from "lib/score-import/framework/goals/goals";
import { UpdateUsersMilestones } from "lib/score-import/framework/milestones/milestones";
import { EfficientDBIterate } from "utils/efficient-db-iterate";
import { ProcessPBs } from "lib/score-import/framework/pb/process-pbs";
import { FormatUserDoc } from "utils/user";
import deepmerge from "deepmerge";

const logger = CreateLogCtx(__filename);

export async function RecalcAllScores(filter = {}) {
	logger.info(`Recalcing All Scores.`);

	const modifiedUsers = new Set<string>();
	const modifiedUserIDs = new Set<integer>();
	const chartIDs = new Set<string>();

	await EfficientDBIterate(
		db.scores,
		async (c) => {
			const chart = await db.charts[c.game].findOne({ chartID: c.chartID });

			if (!chart) {
				logger.error(`Can't find chartID ${c.chartID} ${c.scoreID} (${c.game})`, {
					score: c,
				});

				throw new Error(`screwed`);
			}

			chartIDs.add(chart.chartID);

			modifiedUsers.add(`${c.game}-${c.playtype}-${c.userID}`);
			modifiedUserIDs.add(c.userID);

			const calculatedData = await CreateCalculatedData(c, chart, c.scoreData.esd, logger);

			return { scoreID: c.scoreID, calculatedData };
		},
		async (updates) => {
			await db.scores.bulkWrite(
				updates.map((e) => ({
					updateOne: {
						filter: {
							scoreID: e.scoreID,
						},
						update: {
							$set: {
								calculatedData: e.calculatedData,
							},
						},
					},
				}))
			);
		},
		filter
	);

	logger.info("Reprocessing PBs...");
	await UpdateAllPBs([...modifiedUserIDs.values()], filter);

	logger.info(`Updating Profiles for ${modifiedUsers.size} users...`);

	for (const userInfo of modifiedUsers.values()) {
		const [game, playtype, strUserID] = userInfo.split("-") as [Game, Playtypes[Game], string];

		const userID = Number(strUserID);

		await UpdateUsersGamePlaytypeStats(
			game as Game,
			playtype as Playtypes[Game],
			userID,
			null,
			logger
		);

		const goalInfo = await GetAndUpdateUsersGoals(game, userID, chartIDs, logger);

		await UpdateUsersMilestones(goalInfo, game, [playtype], userID, logger);
	}

	logger.info(`Done!`);
}

export async function UpdateAllPBs(userIDs?: integer[], filter = {}) {
	let allUsers: PublicUserDocument[];

	if (!userIDs) {
		allUsers = await db.users.find({});
	} else {
		allUsers = await db.users.find({
			id: { $in: userIDs },
		});
	}

	for (const user of allUsers) {
		logger.verbose(`Finding ${FormatUserDoc(user)}'s scores.`);

		const scores = await db.scores.find(deepmerge({ userID: user.id }, filter), {
			projection: { chartID: 1 },
		});

		logger.verbose(`PBing ${FormatUserDoc(user)}'s scores.`);
		await ProcessPBs(user.id, new Set(scores.map((e) => e.chartID)), logger);
	}

	logger.info(`Done!`);
}

/* eslint-disable no-await-in-loop */
import { ONE_DAY } from "lib/constants/time";
import CreateLogCtx from "lib/logger/logger";
import { TachiConfig } from "lib/setup/config";
import { IndexOptions } from "mongodb";
import monk, { IMonkManager } from "monk";
import { Random20Hex } from "utils/misc";
import db, { Databases, monkDB } from "./db";

const logger = CreateLogCtx(__filename);

interface Index {
	fields: Record<string, unknown>;
	options?: IndexOptions;
}

function index(fields: Record<string, unknown>, options?: IndexOptions) {
	return { fields, options };
}

const UNIQUE = { unique: true };

const staticIndexes: Partial<Record<Databases, Index[]>> = {
	scores: [
		index({ scoreID: 1 }, UNIQUE),
		index({ chartID: 1, userID: 1 }),
		index({ userID: 1, game: 1, playtype: 1 }),
	],
	"personal-bests": [
		index({ chartID: 1, userID: 1 }, UNIQUE),
		index({ chartID: 1, "scoreData.percent": 1 }),
		index({ userID: 1, game: 1, playtype: 1 }),
	],
	sessions: [
		index({ userID: 1, game: 1, playtype: 1, timeStarted: 1, timeEnded: 1 }),
		// Optimises score modification, since sessions need to be repointed.
		// also, just generally useful.
		index({ "scoreInfo.scoreID": 1 }),
		index({ name: "text" }),
	],
	"game-stats": [index({ userID: 1, game: 1, playtype: 1 }, UNIQUE)],
	"game-settings": [index({ userID: 1, game: 1, playtype: 1 }, UNIQUE)],
	"folder-chart-lookup": [index({ chartID: 1, folderID: 1 }, UNIQUE)],
	goals: [index({ goalID: 1 }, UNIQUE), index({ game: 1, playtype: 1 }), index({ name: "text" })],
	"goal-subs": [index({ goalID: 1, userID: 1 }, UNIQUE), index({ goalID: 1 })],
	milestones: [
		index({ milestoneID: 1 }, UNIQUE),
		index({ game: 1, playtype: 1 }),
		index({ name: "text" }),
	],
	"milestone-subs": [
		index({ milestoneID: 1, userID: 1 }, UNIQUE),
		index({ userID: 1, game: 1, playtype: 1 }),
	],
	"milestone-sets": [
		index({ setID: 1 }, UNIQUE),
		index({ game: 1, playtype: 1 }),
		index({ milestones: 1 }),
	],
	imports: [index({ importID: 1 }, UNIQUE)],
	"import-timings": [
		index({ importID: 1 }, UNIQUE),
		index({ timestamp: 1 }),
		index({ total: 1 }),
	],
	users: [
		index({ id: 1 }, UNIQUE),
		index({ id: 1, authLevel: 1 }, UNIQUE),
		index({ username: 1 }, UNIQUE),
		index({ usernameLowercase: 1 }, UNIQUE),
	],
	folders: [
		index({ folderID: 1 }, UNIQUE),
		index({ game: 1, playtype: 1, table: 1, tableIndex: 1 }),
		index({ title: "text", searchTerms: "text" }),
	],
	"kai-auth-tokens": [index({ userID: 1, service: 1 }, UNIQUE)],
	"bms-course-lookup": [index({ md5sums: 1 }, UNIQUE)],
	"api-tokens": [index({ token: 1 }, UNIQUE), index({ userID: 1 })],
	tables: [index({ tableID: 1, game: 1, playtype: 1 }, UNIQUE)],
	"game-stats-snapshots": [index({ timestamp: 1, userID: 1, game: 1, playtype: 1 }, UNIQUE)],
	"session-view-cache": [
		index({ sessionID: 1, ip: 1 }, UNIQUE),
		index({ timestamp: 1 }, { expireAfterSeconds: ONE_DAY / 1000 }),
	],
	"user-settings": [index({ userID: 1 }, UNIQUE)],
	"user-private-information": [index({ userID: 1 }, UNIQUE), index({ email: 1 }, UNIQUE)],
	"fer-settings": [index({ userID: 1 }, UNIQUE)],
	counters: [index({ counterName: 1 }, UNIQUE)],
	"class-achievements": [index({ game: 1, playtype: 1, timeAchieved: 1 })],
	"api-clients": [index({ clientID: 1 }, UNIQUE)],
	"charts-iidx": [
		index(
			{ "data.arcChartID": 1 },
			{ unique: true, partialFilterExpression: { "data.arcChartID": { $type: "string" } } }
		),
		index({ "data.hashSHA256": 1 }),
		index({ "data.inGameID": 1, playtype: 1, difficulty: 1 }),
	],
	"charts-bms": [index({ "data.hashMD5": 1 }, UNIQUE), index({ "data.hashSHA256": 1 }, UNIQUE)],
	"charts-popn": [index({ "data.hashSHA256": 1 }, UNIQUE)],
	"charts-sdvx": [index({ "data.inGameID": 1, difficulty: 1 }, UNIQUE)],
	"charts-maimai": [
		index({ "data.inGameID": 1, difficulty: 1 }, UNIQUE),
		index({ "data.inGameStrID": 1, difficulty: 1 }, UNIQUE),
	],
	"charts-museca": [index({ "data.inGameID": 1, difficulty: 1 }, UNIQUE)],
	"charts-chunithm": [index({ "data.inGameID": 1, difficulty: 1 }, UNIQUE)],
	"charts-gitadora": [index({ "data.inGameID": 1, difficulty: 1 }, UNIQUE)],
	"charts-wacca": [index({ isHot: 1 })],
	"charts-usc": [index({ "data.hashSHA1": 1, playtype: 1 }, UNIQUE)],
	"charts-jubeat": [index({ "data.inGameID": 1, difficulty: 1 }, UNIQUE)],
	"charts-pms": [
		index({ "data.hashSHA256": 1, playtype: 1 }, UNIQUE),
		index({ "data.hashMD5": 1, playtype: 1 }, UNIQUE),
	],
};

const indexes: Partial<Record<Databases, Index[]>> = staticIndexes;

for (const game of TachiConfig.GAMES) {
	if (indexes[`charts-${game}` as Databases]) {
		indexes[`charts-${game}` as Databases]!.push(
			index({ chartID: 1 }, UNIQUE),
			index(
				{ songID: 1, difficulty: 1, playtype: 1, isPrimary: 1 },
				{ unique: true, partialFilterExpression: { isPrimary: { $eq: true } } }
			),
			index({ songID: 1 }),
			index({ playtype: 1 })
		);
	} else {
		indexes[`charts-${game}` as Databases] = [
			index({ chartID: 1 }, UNIQUE),
			index({ songID: 1, difficulty: 1, playtype: 1, isPrimary: 1 }, UNIQUE),
			index({ songID: 1 }),
			index({ playtype: 1 }),
		];
	}

	if (indexes[`songs-${game}` as Databases]) {
		indexes[`songs-${game}` as Databases]!.push(
			index({ id: 1 }, UNIQUE),
			index({ title: "text", artist: "text", altTitles: "text", searchTerms: "text" })
		);
	} else {
		indexes[`songs-${game}` as Databases] = [
			index({ id: 1 }, UNIQUE),
			index({ title: 1 }),
			index({ title: "text", artist: "text", altTitles: "text", searchTerms: "text" }),
		];
	}
}

export async function SetIndexesWithDB(db: IMonkManager, reset: boolean) {
	const collections = (await db.listCollections()).map((e) => e.name);

	for (const collection in indexes) {
		if (!collections.includes(collection)) {
			// this creates a collection, i cant find the createCollection
			// call.
			const tmp = Random20Hex();
			await db.get(collection).insert({ __tmp: tmp });
			await db.get(collection).remove({ __tmp: tmp });
		}

		if (reset) {
			await db.get(collection).dropIndexes();
			logger.debug(`Reset ${collection}.`);
		}

		// @ts-expect-error dru(n)kts
		for (const index of indexes[collection]) {
			const r = await db.get(collection).createIndex(index.fields, index.options);

			logger.debug(r);
		}
	}

	logger.debug("Done.");
}

export async function SetIndexes(mongoUrl: string, reset: boolean) {
	const monkDb = monk(mongoUrl);

	await SetIndexesWithDB(monkDb, reset);

	await monkDb.close();
}

export function SetIndexesIfNoneSet() {
	// If no indexes are set, then we need to load mongo indexes.
	return db.users
		.indexes()
		.then((r) => {
			// If there's only one index on users
			// that means that only _id has indexes.
			// This means that there are likely to be no indexes
			// configured in the database.
			if (Object.keys(r).length === 1) {
				logger.info(
					`No indexes on users, First-time Tachi-Server startup assumed. Running SetIndexes.`
				);
				SetIndexesWithDB(monkDB, true);
			}
		})
		.catch((err) => {
			logger.info(
				`Error in finding users collection. First time startup likely. Running SetIndexes.`,
				err
			);
			SetIndexesWithDB(monkDB, true);
		});
}

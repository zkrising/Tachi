/* eslint-disable no-await-in-loop */
import monk from "monk";
import { IndexOptions } from "mongodb";
import { ValidDatabases } from "tachi-common";
import CreateLogCtx from "lib/logger/logger";
import { ServerTypeInfo } from "lib/setup/config";
import { ONE_DAY } from "lib/constants/time";

const logger = CreateLogCtx(__filename);

interface Index {
	fields: Record<string, unknown>;
	options?: IndexOptions;
}

function index(fields: Record<string, unknown>, options?: IndexOptions) {
	return { fields, options };
}

const UNIQUE = { unique: true };

const staticIndexes: Partial<Record<ValidDatabases, Index[]>> = {
	scores: [
		index({ scoreID: 1 }, UNIQUE),
		index({ chartID: 1, userID: 1 }),
		index({ game: 1, playtype: 1, userID: 1 }),
	],
	"personal-bests": [
		index({ chartID: 1, userID: 1 }, UNIQUE),
		index({ chartID: 1, "scoreData.percent": 1 }),
		index({ game: 1, playtype: 1, userID: 1 }),
	],
	sessions: [
		// lol
		index({ timeStarted: 1, timeEnded: 1, userID: 1, game: 1, playtype: 1 }),
		index({ name: "text" }),
	],
	"game-stats": [index({ userID: 1, game: 1, playtype: 1 }, UNIQUE)],
	"game-settings": [index({ userID: 1, game: 1, playtype: 1 }, UNIQUE)],
	"folder-chart-lookup": [index({ chartID: 1, folderID: 1 }, UNIQUE)],
	"tierlist-data": [
		index({ tierlistDataID: 1 }, UNIQUE),
		index({ chartID: 1, tierlistID: 1 }),
		index({ chartID: 1, tierlistID: 1, type: 1 }),
		index({ chartID: 1, tierlistID: 1, type: 1, key: 1 }, UNIQUE),
	],
	goals: [index({ goalID: 1 }, UNIQUE)],
	"user-goals": [index({ goalID: 1, userID: 1 }, UNIQUE), index({ goalID: 1 })],
	milestones: [index({ milestoneID: 1 }, UNIQUE), index({ group: 1, game: 1, playtype: 1 })],
	"user-milestones": [
		index({ milestoneID: 1, userID: 1 }, UNIQUE),
		index({ userID: 1, game: 1, playtype: 1 }),
	],
	imports: [index({ importID: 1 }, UNIQUE)],
	"import-timings": [
		index({ importID: 1 }, UNIQUE),
		index({ timestamp: 1 }),
		index({ total: 1 }),
	],
	users: [
		index({ id: 1 }, UNIQUE),
		index({ username: 1 }, UNIQUE),
		index({ usernameLowercase: 1 }, UNIQUE),
	],
	tierlists: [
		index({ tierlistID: 1 }, UNIQUE),
		index({ game: 1, playtype: 1, isDefault: 1 }, UNIQUE),
	],
	folders: [
		index({ folderID: 1 }, UNIQUE),
		index({ game: 1, playtype: 1 }),
		index({ game: 1, playtype: 1, table: 1 }),
		index({ game: 1, playtype: 1, table: 1, tableIndex: 1 }),
		index({ title: "text" }),
	],
	"kai-auth-tokens": [index({ userID: 1, service: 1 }, UNIQUE)],
	"charts-iidx": [
		index(
			{ "data.arcChartID": 1 },
			{ unique: true, partialFilterExpression: { "data.arcChartID": { $type: "string" } } }
		),
		index({ "data.hashSHA256": 1 }),
	],
	"bms-course-lookup": [index({ md5sums: 1 }, UNIQUE)],
	"api-tokens": [index({ token: 1 }, UNIQUE), index({ userID: 1 })],
	tables: [index({ tableID: 1, game: 1, playtype: 1 }, UNIQUE)],
	"game-stats-snapshots": [index({ timestamp: 1, userID: 1, game: 1, playtype: 1 }, UNIQUE)],
	"session-view-cache": [
		index({ sessionID: 1, ip: 1 }, UNIQUE),
		index({ timestamp: 1 }, { expireAfterSeconds: ONE_DAY / 1000 }),
	],
	"user-settings": [index({ userID: 1 }, UNIQUE)],
};

const indexes: Partial<Record<ValidDatabases, Index[]>> = staticIndexes;

for (const game of ServerTypeInfo.supportedGames) {
	if (indexes[`charts-${game}` as ValidDatabases]) {
		indexes[`charts-${game}` as ValidDatabases]!.push(
			index({ chartID: 1 }, UNIQUE),
			index(
				{ songID: 1, difficulty: 1, playtype: 1, isPrimary: 1 },
				{ unique: true, partialFilterExpression: { isPrimary: { $eq: true } } }
			)
		);
	} else {
		indexes[`charts-${game}` as ValidDatabases] = [
			index({ chartID: 1 }, UNIQUE),
			index({ songID: 1, difficulty: 1, playtype: 1, isPrimary: 1 }, UNIQUE),
		];
	}

	if (indexes[`songs-${game}` as ValidDatabases]) {
		indexes[`songs-${game}` as ValidDatabases]!.push(
			index({ id: 1 }, UNIQUE),
			index({ title: "text", artist: "text", "alt-titles": "text", "search-titles": "text" })
		);
	} else {
		indexes[`songs-${game}` as ValidDatabases] = [
			index({ id: 1 }, UNIQUE),
			index({ title: 1 }),
			index({ title: "text", artist: "text", "alt-titles": "text", "search-titles": "text" }),
		];
	}
}

export async function SetIndexes(mongoURL: string, reset: boolean) {
	const db = monk(mongoURL);

	logger.debug(`Starting indexing for ${mongoURL}...`);

	const collections = (await db.listCollections()).map((e) => e.name);

	for (const collection in indexes) {
		if (!collections.includes(collection)) {
			// this creates a collection, i cant find the createCollection
			// call.
			await db.get(collection).insert({});
			await db.get(collection).remove({});
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

	await db.close();
}

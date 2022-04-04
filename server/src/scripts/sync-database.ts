/* eslint-disable no-await-in-loop */
// This script syncs this tachi instances database up with the tachi-database-seeds.

import { monkDB } from "external/mongo/db";
import fjsh from "fast-json-stable-hash";
import { PullDatabaseSeeds } from "lib/database-seeds/repo";
import CreateLogCtx, { KtLogger } from "lib/logger/logger";
import UpdateIsPrimaryStatus from "lib/score-mutation/update-isprimary";
import { TachiConfig } from "lib/setup/config";
import { BulkWriteOperation } from "mongodb";
import { ICollection } from "monk";
import {
	BMSCourseDocument,
	ChartDocument,
	FolderDocument,
	Game,
	SongDocument,
	TableDocument,
} from "tachi-common";
import { RecalcAllScores } from "utils/calculations/recalc-scores";
import { UpdateGameSongIDCounter } from "utils/db";
import { InitaliseFolderChartLookup } from "utils/folder";

interface SyncInstructions {
	pattern: RegExp;
	handler: (
		c: any[],
		collection: ICollection<any>,
		logger: KtLogger,
		collectionName: string
	) => Promise<unknown>;
}

async function RemoveNotPresent<T>(
	documents: T[],
	collection: ICollection<T>,
	field: keyof T,
	logger: KtLogger
) {
	logger.verbose(`Removing all documents that are no longer present.`);
	// Remove anything no longer present.
	// Note that $nin is incredibly slow.
	// @ts-expect-error generic system failing
	const r = await collection.remove({
		[field]: { $nin: documents.map((e) => e[field]) },
	});

	// @ts-expect-error These types are broken!
	if (r.deletedCount) {
		// @ts-expect-error These types are broken!
		logger.info(`Removed ${r.deletedCount} documents.`);
	}
}

async function GenericUpsert<T>(
	documents: T[],
	collection: ICollection<T>,
	field: keyof T,
	logger: KtLogger,
	remove = false
) {
	logger.verbose(`Running bulkwrite.`);

	const bwriteOps: BulkWriteOperation<T>[] = [];

	const allExistingDocs = await collection.find({});

	const map = new Map();
	for (const doc of allExistingDocs) {
		map.set(doc[field], doc);
	}

	const changedFields = [];

	let i = 0;
	for (const document of documents) {
		i++;
		if (i % 10_000 === 0) {
			logger.verbose(`On document ${i}/${documents.length}.`);
		}

		const exists = map.get(document[field]);

		if (!exists) {
			bwriteOps.push({
				// @ts-expect-error Actually, T is assignable to OptionalId<T>.
				insertOne: { document },
			});
		} else if (fjsh.hash(document, "sha256") !== fjsh.hash(exists, "sha256")) {
			bwriteOps.push({
				replaceOne: {
					// @ts-expect-error Known X->Y generic issue.
					filter: {
						[field]: document[field],
					},
					replacement: document,
				},
			});

			changedFields.push(field);
		}

		// free some memory.
		map.delete(document[field]);
	}

	if (bwriteOps.length === 0) {
		logger.verbose(`No differences. Not performing any update.`);
	} else {
		const { deletedCount, insertedCount, matchedCount, upsertedCount, modifiedCount } =
			await collection.bulkWrite(bwriteOps);

		logger.info(`Performed bulkWrite.`, {
			deletedCount,
			insertedCount,
			matchedCount,
			upsertedCount,
			modifiedCount,
		});
	}

	if (remove) {
		await RemoveNotPresent(documents, collection, field, logger);
	}

	return {
		thingsChanged: bwriteOps.length,
		changedFields,
	};
}

const syncInstructions: SyncInstructions[] = [
	{
		pattern: /^charts-(b|p)ms/u,
		handler: async (
			charts: ChartDocument[],
			collection: ICollection<ChartDocument>,
			logger,
			collectionName
		) => {
			const r = await GenericUpsert(charts, collection, "chartID", logger, false);

			if (r.thingsChanged) {
				await InitaliseFolderChartLookup();
				await UpdateIsPrimaryStatus();

				await UpdateGameSongIDCounter(collectionName.includes("bms") ? "bms" : "pms");

				await RecalcAllScores({
					chartID: { $in: r.changedFields },
				});
			}
		},
	},
	{
		pattern: /^charts-/u,
		handler: async (
			charts: ChartDocument[],
			collection: ICollection<ChartDocument>,
			logger
		) => {
			const r = await GenericUpsert(charts, collection, "chartID", logger, true);

			if (r.thingsChanged) {
				await InitaliseFolderChartLookup();
				await UpdateIsPrimaryStatus();

				await RecalcAllScores({
					chartID: { $in: r.changedFields },
				});
			}
		},
	},
	{
		pattern: /^songs-(b|p)ms/u,
		handler: async (songs: SongDocument[], collection: ICollection<SongDocument>, logger) => {
			const r = await GenericUpsert(songs, collection, "id", logger, false);

			if (r.thingsChanged) {
				await RecalcAllScores({
					songID: { $in: r.changedFields },
				});
			}
		},
	},
	{
		pattern: /^songs-/u,
		handler: async (songs: SongDocument[], collection: ICollection<SongDocument>, logger) => {
			const r = await GenericUpsert(songs, collection, "id", logger, true);

			if (r.thingsChanged) {
				await RecalcAllScores({
					songID: { $in: r.changedFields },
				});
			}
		},
	},
	{
		pattern: /^folders/u,
		handler: async (
			folders: FolderDocument[],
			collection: ICollection<FolderDocument>,
			logger
		) => {
			const r = await GenericUpsert(
				folders.filter((e) => TachiConfig.GAMES.includes(e.game)),
				collection,
				"folderID",
				logger,
				true
			);

			if (r) {
				await InitaliseFolderChartLookup();
			}
		},
	},
	{
		pattern: /^tables/u,
		handler: (tables: TableDocument[], collection: ICollection<TableDocument>, logger) =>
			GenericUpsert(
				tables.filter((e) => TachiConfig.GAMES.includes(e.game)),
				collection,
				"tableID",
				logger,
				true
			),
	},
	{
		pattern: /^bms-course-lookup/u,
		handler: async (
			bmsCourseDocuments: BMSCourseDocument[],
			collection: ICollection<BMSCourseDocument>,
			logger
		) => {
			if (TachiConfig.TYPE === "ktchi") {
				return;
			}

			await GenericUpsert(bmsCourseDocuments, collection, "md5sums", logger);
		},
	},
];

const logger = CreateLogCtx("Database Sync");

async function SynchroniseDBWithSeeds() {
	// Wait for mongo to connect first.
	await monkDB.then(() => void 0);

	const databaseSeedsRepo = await PullDatabaseSeeds();

	for await (const { collectionName, data } of databaseSeedsRepo.IterateCollections()) {
		const spawnLogger = CreateLogCtx(`${collectionName} Sync`);

		if (collectionName.startsWith("songs-") || collectionName.startsWith("charts-")) {
			const game = collectionName.split("-")[1];

			if (!TachiConfig.GAMES.includes(game as Game)) {
				spawnLogger.verbose(
					`Skipping ${collectionName} (${game}) as it isn't for ${TachiConfig.NAME}.`
				);
				continue;
			}
		}

		spawnLogger.verbose(`Found ${data.length} documents.`);

		let matchedSomething = false;
		for (const syncInst of syncInstructions) {
			if (collectionName.match(syncInst.pattern)) {
				spawnLogger.verbose(`Starting handler...`);
				await syncInst.handler(
					data,
					monkDB.get(collectionName),
					spawnLogger,
					collectionName
				);
				matchedSomething = true;
				break;
			}
		}

		if (!matchedSomething) {
			spawnLogger.warn(
				`Collection ${collectionName} didn't match any sync instructions. Skipping.`
			);
		}
	}

	logger.info(`Done.`);
}

if (require.main === module) {
	SynchroniseDBWithSeeds().then(() => process.exit(0));
}

/* eslint-disable no-await-in-loop */
// This script syncs this tachi instances database up with the tachi-database-seeds.

import { Command } from "commander";
import db, { monkDB } from "external/mongo/db";
import fjsh from "fast-json-stable-hash";
import { PullDatabaseSeeds } from "lib/database-seeds/repo";
import CreateLogCtx from "lib/logger/logger";
import UpdateIsPrimaryStatus from "lib/score-mutation/update-isprimary";
import { ServerConfig, TachiConfig } from "lib/setup/config";
import { RemoveStaleFolderShowcaseStats } from "lib/showcase/showcase";
import { UpdateQuestSubscriptions } from "lib/targets/quests";
import { RecalcAllScores } from "utils/calculations/recalc-scores";
import { UpdateGameSongIDCounter } from "utils/db";
import { InitaliseFolderChartLookup } from "utils/folder";
import { ArrayDiff, IsSupported, WrapScriptPromise } from "utils/misc";
import type { KtLogger } from "lib/logger/logger";
import type { BulkWriteOperation, DeleteWriteOpResultObject } from "mongodb";
import type { ICollection } from "monk";
import type {
	BMSCourseDocument,
	ChartDocument,
	FolderDocument,
	Game,
	GoalDocument,
	QuestDocument,
	QuestlineDocument,
	SongDocument,
	TableDocument,
} from "tachi-common";

interface SyncInstructions {
	pattern: RegExp;
	handler: (
		c: Array<any>,
		collection: ICollection,
		logger: KtLogger,
		collectionName: string
	) => Promise<unknown>;
}

async function RemoveNotPresent<T extends Record<string, any>>(
	documents: Array<T>,
	collection: ICollection<T>,
	field: keyof T,
	logger: KtLogger
) {
	logger.verbose(`Removing all documents that are no longer present.`);

	// Remove anything no longer present.
	// Note that $nin is incredibly slow.
	// @ts-expect-error generic system failing
	const r = (await collection.remove({
		[field]: { $nin: documents.map((e) => e[field] as unknown) },
	})) as DeleteWriteOpResultObject;

	if (r.deletedCount !== undefined && r.deletedCount > 0) {
		logger.info(`Removed ${r.deletedCount} documents.`);
	}
}

async function GenericUpsert<T extends Record<string, any>>(
	documents: Array<T>,
	collection: ICollection<T>,
	field: keyof T,
	logger: KtLogger,
	remove = false,
	update = true
) {
	logger.verbose(`Running bulkwrite.`);

	const bwriteOps: Array<BulkWriteOperation<T>> = [];

	const allExistingDocs = await collection.find({});

	const map = new Map<unknown, T>();

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

		if (exists === undefined) {
			bwriteOps.push({
				// @ts-expect-error Actually, T is assignable to OptionalId<T>.
				insertOne: { document },
			});
		} else if (update && fjsh.hash(document, "sha256") !== fjsh.hash(exists, "sha256")) {
			bwriteOps.push({
				replaceOne: {
					// @ts-expect-error Known X->Y generic issue.
					filter: {
						[field]: document[field],
					},
					replacement: document,
				},
			});

			changedFields.push(document[field]);
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

const syncInstructions: Array<SyncInstructions> = [
	{
		pattern: /^charts-(b|p)ms/u,
		handler: async (
			charts: Array<ChartDocument>,
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
					game: collectionName.split("-")[0],
				});
			}
		},
	},
	{
		pattern: /^charts-/u,
		handler: async (
			charts: Array<ChartDocument>,
			collection: ICollection<ChartDocument>,
			logger,
			collName
		) => {
			const r = await GenericUpsert(charts, collection, "chartID", logger, true);

			if (r.thingsChanged) {
				await InitaliseFolderChartLookup();
				await UpdateIsPrimaryStatus();

				await RecalcAllScores({
					chartID: { $in: r.changedFields },
					game: collName.split("-")[0],
				});
			}
		},
	},
	{
		pattern: /^songs-(b|p)ms/u,
		handler: async (
			songs: Array<SongDocument>,
			collection: ICollection<SongDocument>,
			logger,
			collName
		) => {
			const r = await GenericUpsert(songs, collection, "id", logger, false);

			if (r.thingsChanged) {
				await RecalcAllScores({
					songID: { $in: r.changedFields },
					game: collName.split("-")[0],
				});
			}
		},
	},
	{
		pattern: /^songs-/u,
		handler: async (
			songs: Array<SongDocument>,
			collection: ICollection<SongDocument>,
			logger,
			collName
		) => {
			const r = await GenericUpsert(songs, collection, "id", logger, true);

			if (r.thingsChanged) {
				await RecalcAllScores({
					songID: { $in: r.changedFields },
					game: collName.split("-")[0],
				});
			}
		},
	},
	{
		pattern: /^folders/u,
		handler: async (
			folders: Array<FolderDocument>,
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

			if (r.thingsChanged) {
				await InitaliseFolderChartLookup();

				const allModifiedFolderIDs = r.changedFields as Array<string>;

				const keptFolderIDs = await db.folders.find(
					{
						folderID: { $in: allModifiedFolderIDs },
					},
					{ projection: { folderID: 1 } }
				);

				// Find out what folders have been removed by diffing the set of all
				// modified folders against all that are still present.
				const removedFolderIDs = ArrayDiff(
					allModifiedFolderIDs,
					keptFolderIDs.map((e) => e.folderID)
				);

				await RemoveStaleFolderShowcaseStats(removedFolderIDs);
			}
		},
	},
	{
		pattern: /^tables/u,
		handler: (tables: Array<TableDocument>, collection: ICollection<TableDocument>, logger) =>
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
			bmsCourseDocuments: Array<BMSCourseDocument>,
			collection: ICollection<BMSCourseDocument>,
			logger
		) => {
			if (TachiConfig.TYPE === "kamai") {
				return;
			}

			await GenericUpsert(bmsCourseDocuments, collection, "md5sums", logger);
		},
	},
	{
		pattern: /^goals/u,
		handler: async (
			goals: Array<GoalDocument>,
			collection: ICollection<GoalDocument>,
			logger
		) => {
			// never remove goals. Never update goals either. Only insert new ones as
			// they come in.
			await GenericUpsert(
				goals.filter((e) => IsSupported(e.game)),
				collection,
				"goalID",
				logger,
				false,
				false
			);
		},
	},
	{
		pattern: /^questlines/u,
		handler: async (
			questlines: Array<QuestlineDocument>,
			collection: ICollection<QuestlineDocument>,
			logger
		) => {
			// removing and updating these is fine. Users cannot subscibe to sets.
			await GenericUpsert(
				questlines.filter((e) => IsSupported(e.game)),
				collection,
				"questlineID",
				logger
			);
		},
	},
	{
		pattern: /^quests/u,
		handler: async (
			quests: Array<QuestDocument>,
			collection: ICollection<QuestDocument>,
			logger
		) => {
			const r = await GenericUpsert(
				quests.filter((e) => IsSupported(e.game)),
				collection,
				"questID",
				logger,
				true
			);

			if (r.thingsChanged) {
				const affectedQuestIDs = r.changedFields as Array<string>;

				await Promise.all(affectedQuestIDs.map((e) => UpdateQuestSubscriptions(e)));
			}
		},
	},
];

const logger = CreateLogCtx("Database Sync");

const program = new Command();

program.option("-l, --localPath <path/to/database-seeds/collections>");

program.parse(process.argv);
const options: {
	localPath: string | undefined;
} = program.opts();

async function SynchroniseDBWithSeeds() {
	// Wait for mongo to connect first.
	await monkDB.then(() => void 0);

	const databaseSeedsRepo = await PullDatabaseSeeds(
		options.localPath,
		ServerConfig.SEEDS_CONFIG?.BRANCH
	);

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
			if (syncInst.pattern.exec(collectionName)) {
				spawnLogger.info(`Starting handler...`);
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

	await databaseSeedsRepo.Destroy();
}

if (require.main === module) {
	WrapScriptPromise(SynchroniseDBWithSeeds(), logger);
}

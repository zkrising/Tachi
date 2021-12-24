/* eslint-disable no-await-in-loop */
// This script syncs this tachi instances database up with the tachi-database-seeds.

import { execSync } from "child_process";
import { monkDB } from "external/mongo/db";
import fjsh from "fast-json-stable-hash";
import fs from "fs";
import CreateLogCtx, { KtLogger } from "lib/logger/logger";
import UpdateIsPrimaryStatus from "lib/score-mutation/update-isprimary";
import { TachiConfig } from "lib/setup/config";
import { BulkWriteOperation } from "mongodb";
import { ICollection } from "monk";
import os from "os";
import path from "path";
import {
	ChartDocument,
	FolderDocument,
	SongDocument,
	TableDocument,
	BMSCourseDocument,
} from "tachi-common";
import { InitaliseFolderChartLookup } from "utils/folder";

interface SyncInstructions {
	pattern: RegExp;
	handler: (c: any[], collection: ICollection<any>, logger: KtLogger) => Promise<unknown>;
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

	if (r.deletedCount) {
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
		await InitaliseFolderChartLookup();
	}

	if (remove) {
		await RemoveNotPresent(documents, collection, field, logger);
	}

	return bwriteOps.length;
}

const syncInstructions: SyncInstructions[] = [
	{
		pattern: /^charts-(usc|bms)$/u,
		handler: async (
			charts: ChartDocument[],
			collection: ICollection<ChartDocument>,
			logger
		) => {
			// Since the USC and BMS databases are managed Bokutachi-side, we
			// shouldn't be honoring any sort of updates from tachi-database-seeds
			// aside from an initial one.
			//
			// However, in practice, these syncs are the best way to actually update
			// issues in the database.
			// We're going to disable this anyway.
			// const isInitial = (await collection.findOne()) === null;

			const r = await GenericUpsert(charts, collection, "chartID", logger, false);

			if (r) {
				await InitaliseFolderChartLookup();
				await UpdateIsPrimaryStatus();
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

			if (r) {
				await InitaliseFolderChartLookup();
			}
		},
	},
	{
		pattern: /^songs-/u,
		handler: (songs: SongDocument[], collection: ICollection<SongDocument>, logger) =>
			GenericUpsert(songs, collection, "id", logger),
	},
	{
		pattern: /^folders$/u,
		handler: async (
			folders: FolderDocument[],
			collection: ICollection<FolderDocument>,
			logger
		) => {
			const r = await GenericUpsert(folders, collection, "folderID", logger, true);

			if (r) {
				await InitaliseFolderChartLookup();
			}
		},
	},
	{
		pattern: /^tables$/u,
		handler: (tables: TableDocument[], collection: ICollection<TableDocument>, logger) =>
			GenericUpsert(tables, collection, "tableID", logger, true),
	},
	{
		pattern: /^bms-course-lookup$/u,
		handler: (
			bmsCourseDocuments: BMSCourseDocument[],
			collection: ICollection<BMSCourseDocument>,
			logger
		) => GenericUpsert(bmsCourseDocuments, collection, "md5sums", logger),
	},
];

const logger = CreateLogCtx("Database Sync");

async function SynchroniseDBWithSeeds() {
	const seedsDir = fs.mkdtempSync(path.join(os.tmpdir(), "tachi-database-seeds-"));

	logger.info(`Cloning data to ${seedsDir}.`);

	fs.rmSync(seedsDir, { recursive: true, force: true });

	// Wait for mongo to connect first.
	await monkDB.then(() => void 0);

	execSync(`git clone https://github.com/TNG-dev/tachi-database-seeds --depth=1 ${seedsDir}`, {
		stdio: "inherit",
	});

	const collections = fs.readdirSync(path.join(seedsDir, "collections"));

	for (const jsonName of collections) {
		const collectionName = path.parse(jsonName).name;
		const spawnLogger = CreateLogCtx(`${collectionName} Sync`);

		if (collectionName.startsWith("songs-") || collectionName.startsWith("charts-")) {
			const game = collectionName.split("-")[1];

			if (!TachiConfig.GAMES.includes(game as any)) {
				spawnLogger.verbose(
					`Skipping ${collectionName} (${game}) as it isn't for ${TachiConfig.NAME}.`
				);
				continue;
			}
		}

		spawnLogger.verbose(`Getting data.`);

		let data = JSON.parse(
			fs.readFileSync(path.join(seedsDir, "collections", jsonName), "utf-8")
		);

		spawnLogger.verbose(`Found ${data.length} documents.`);

		let matchedSomething = false;
		for (const syncInst of syncInstructions) {
			if (collectionName.match(syncInst.pattern)) {
				spawnLogger.verbose(`Starting handler...`);
				await syncInst.handler(data, monkDB.get(collectionName), spawnLogger);
				matchedSomething = true;
				break;
			}
		}

		// free memory forcefully
		data = null;

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

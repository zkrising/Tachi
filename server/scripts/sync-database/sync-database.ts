/* eslint-disable no-await-in-loop */
// This script syncs this tachi instances database up with the tachi-database-seeds.

import { execSync } from "child_process";
import deepEqual from "deep-equal";
import { monkDB } from "external/mongo/db";
import fs from "fs";
import CreateLogCtx, { KtLogger } from "lib/logger/logger";
import { ServerTypeInfo } from "lib/setup/config";
import { BulkWriteOperation } from "mongodb";
import { ICollection } from "monk";
import os from "os";
import path from "path";
import { ChartDocument, FolderDocument, SongDocument, TableDocument } from "tachi-common";

interface SyncInstructions {
	pattern: RegExp;
	handler: (c: any[], collection: ICollection<any>, logger: KtLogger) => Promise<void>;
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
			logger.info(`On document ${i}/${documents.length}.`);
		}

		const exists = map.get(document[field]);

		if (!exists) {
			bwriteOps.push({
				// @ts-expect-error Actually, T is assignable to OptionalId<T>.
				insertOne: { document },
			});
		} else if (!deepEqual(document, exists, { strict: true })) {
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
		logger.info(`No differences. Not performing any update.`);
	} else {
		const result = await collection.bulkWrite(bwriteOps);
		logger.info(`Performed bulkWrite.`, result);
	}

	if (remove) {
		await RemoveNotPresent(documents, collection, field, logger);
	}
}

const syncInstructions: SyncInstructions[] = [
	{
		pattern: /^charts-/u,
		handler: (charts: ChartDocument[], collection: ICollection<ChartDocument>, logger) =>
			GenericUpsert(charts, collection, "chartID", logger),
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
			const bwriteOps: BulkWriteOperation<FolderDocument>[] = [];

			for (const folder of folders) {
				if (!ServerTypeInfo.supportedGames.includes(folder.game)) {
					continue; // Skip things for games we don't care about.
				}

				const exists = await collection.findOne({
					folderID: folder.folderID,
				});

				if (!exists) {
					bwriteOps.push({
						// @ts-expect-error faulty monk types
						insertOne: { document: folder },
					});
				} else if (!deepEqual(folder, exists, { strict: true })) {
					bwriteOps.push({
						updateOne: {
							filter: {
								folderID: folder.folderID,
							},
							update: {
								$set: folder,
							},
						},
					});
				}
			}

			if (bwriteOps.length) {
				await collection.bulkWrite(bwriteOps);
			}
		},
	},
	{
		pattern: /^tables$/u,
		handler: async (
			tables: TableDocument[],
			collection: ICollection<TableDocument>,
			logger
		) => {
			const bwriteOps: BulkWriteOperation<TableDocument>[] = [];

			for (const table of tables) {
				if (!ServerTypeInfo.supportedGames.includes(table.game)) {
					continue; // Skip things for games we don't care about.
				}

				const exists = await collection.findOne({
					tableID: table.tableID,
				});

				if (!exists) {
					bwriteOps.push({
						// @ts-expect-error faulty monk types
						insertOne: { document: table },
					});
				} else if (!deepEqual(table, exists, { strict: true })) {
					bwriteOps.push({
						updateOne: {
							filter: {
								tableID: table.tableID,
							},
							update: {
								$set: table,
							},
						},
					});
				}
			}

			if (bwriteOps.length) {
				await collection.bulkWrite(bwriteOps);
			}
		},
	},
];

const logger = CreateLogCtx("Database Sync");

async function SynchroniseDBWithSeeds() {
	const seedsDir = fs.mkdtempSync(path.join(os.tmpdir(), "tachi-database-seeds-"));

	logger.info(`Cloning data to ${seedsDir}.`);

	fs.rmSync(seedsDir, { recursive: true, force: true });

	execSync(`git clone https://github.com/TNG-dev/tachi-database-seeds --depth=1 ${seedsDir}`, {
		stdio: "inherit",
	});

	const collections = fs.readdirSync(path.join(seedsDir, "collections"));

	for (const jsonName of collections) {
		const collectionName = path.parse(jsonName).name;
		const spawnLogger = CreateLogCtx(`${collectionName} Sync`);

		if (collectionName.startsWith("songs-") || collectionName.startsWith("charts-")) {
			const game = collectionName.split("-")[1];

			if (!ServerTypeInfo.supportedGames.includes(game as any)) {
				spawnLogger.info(
					`Skipping ${collectionName} (${game}) as it isn't for ${ServerTypeInfo.name}.`
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

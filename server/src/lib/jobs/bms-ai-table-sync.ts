/* eslint-disable no-await-in-loop */
import { PullDatabaseSeeds } from "lib/database-seeds/repo";
import CreateLogCtx from "lib/logger/logger";
import fetch from "node-fetch";
import type { ChartDocument } from "tachi-common";

const AI_URL = "https://bms.hexlataia.xyz/tables/json/ai.json";

const logger = CreateLogCtx(__filename);

interface AITableEntry {
	level: string;
	md5: string;
}

export async function UpdateAILevels() {
	const data = (await fetch(AI_URL).then((r) => r.json())) as Array<AITableEntry>;

	const map = Object.fromEntries(data.map((e) => [e.md5, e.level]));

	const repo = await PullDatabaseSeeds();

	await repo.MutateCollection<ChartDocument<"bms:7K">>("charts-bms", (charts) => {
		for (const chart of charts) {
			chart.data.aiRating = map[chart.data.hashMD5] ?? null;
		}

		return charts;
	});
}

if (require.main === module) {
	UpdateAILevels()
		.then(() => process.exit(0))
		.catch((err: unknown) => {
			logger.error(`Failed to sync BMS AI Table.`, { err }, () => {
				process.exit(1);
			});
		});
}

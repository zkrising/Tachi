/* eslint-disable no-await-in-loop */
import CreateLogCtx from "lib/logger/logger";
import { PullDatabaseSeeds } from "lib/seeds/repo";
import fetch from "node-fetch";
import { WrapScriptPromise } from "utils/misc";
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
			chart.data.aiLevel = map[chart.data.hashMD5] ?? null;
		}

		return charts;
	});

	await repo.Destroy();
}

if (require.main === module) {
	WrapScriptPromise(UpdateAILevels(), logger);
}

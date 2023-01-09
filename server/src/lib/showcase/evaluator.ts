import db from "external/mongo/db";
import { GetGPTConfig } from "tachi-common";
import { GetFolderChartIDs } from "utils/folder";
import type {
	GPTString,
	ShowcaseStatChart,
	ShowcaseStatDetails,
	ShowcaseStatFolder,
	integer,
} from "tachi-common";

export function EvaluateShowcaseStat(
	gpt: GPTString,
	details: ShowcaseStatDetails,
	userID: integer
): Promise<{
	value: number | null;
	outOf?: number;
}> {
	switch (details.mode) {
		case "chart":
			return EvaluateShowcaseChartStat(gpt, details, userID);
		case "folder":
			return EvaluateShowcaseFolderStat(gpt, details, userID);

		default:
			// @ts-expect-error This should never happen anyway -- this ignore ignores a 'never' result.
			throw new Error(`Invalid mode of ${details.mode} as details mode?`);
	}
}

async function EvaluateShowcaseChartStat(
	gpt: GPTString,
	details: ShowcaseStatChart,
	userID: integer
) {
	// requires special handling
	if (details.metric === "playcount") {
		return { value: await db.scores.count({ chartID: details.chartID, userID }) };
	}

	const mongoProp = PropToMongoProp(gpt, details.metric);

	const pb = await db["personal-bests"].findOne(
		{ chartID: details.chartID, userID },
		{ projection: { [mongoProp]: 1 } }
	);

	if (!pb) {
		return { value: null };
	}

	const metric = details.metric;

	const gptConfig = GetGPTConfig(gpt);

	const scoreMetricConfig = gptConfig.providedMetrics[metric] ?? gptConfig.derivedMetrics[metric];

	if (!scoreMetricConfig) {
		throw new Error(`Invalid metric of ${metric} passed for game ${gpt}.`);
	}

	if (scoreMetricConfig.type === "ENUM") {
		// @ts-expect-error guaranteed to be correct
		return { value: pb.scoreData.enumIndexes[metric] };
	}

	// @ts-expect-error guaranteed to be correct
	return { value: pb.scoreData[metric] };
}

async function EvaluateShowcaseFolderStat(
	gpt: GPTString,
	details: ShowcaseStatFolder,
	userID: integer
) {
	let chartIDs;

	if (Array.isArray(details.folderID)) {
		chartIDs = (await Promise.all(details.folderID.map(GetFolderChartIDs))).flat(1);
	} else {
		chartIDs = await GetFolderChartIDs(details.folderID);
	}

	const mongoProp = PropToMongoProp(gpt, details.metric);

	const value = await db["personal-bests"].count({
		userID,

		// @optimisable - This is slightly inefficent, maybe we can use relational-style querying?
		chartID: { $in: chartIDs },
		[mongoProp]: { $gte: details.gte },
	});

	return { value, outOf: chartIDs.length };
}

function PropToMongoProp(gpt: GPTString, metric: string) {
	const gptConfig = GetGPTConfig(gpt);

	const scoreMetricConfig = gptConfig.providedMetrics[metric] ?? gptConfig.derivedMetrics[metric];

	if (!scoreMetricConfig) {
		throw new Error(`Invalid metric of ${metric} passed for game ${gpt}.`);
	}

	if (scoreMetricConfig.type === "ENUM") {
		return `scoreData.enumIndexes.${metric}`;
	}

	return `scoreData.${metric}`;
}

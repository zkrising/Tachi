import { HumanFriendlyStrToGradeIndex, HumanFriendlyStrToLampIndex } from "util/str-to-num";
import { ValueGetterOrHybrid } from "util/ztable/search";
import {
	BMS_TABLES,
	ChartDocument,
	Game,
	GamePTConfig,
	GetGamePTConfig,
	GPTString,
	Playtype,
} from "tachi-common";
import { ComparePBsDataset, FolderDataset, PBDataset, ScoreDataset } from "types/tables";

function GetBMSTableVal(chart: ChartDocument<"bms:7K" | "bms:14K">, key: string) {
	for (const table of chart.data.tableFolders) {
		if (table.table === key) {
			return Number(table.level);
		}
	}

	return null;
}

export function CreateDefaultScoreSearchParams<GPT extends GPTString = GPTString>(
	game: Game,
	playtype: Playtype
) {
	const gptConfig = GetGamePTConfig(game, playtype);

	const searchFunctions: Record<string, ValueGetterOrHybrid<ScoreDataset<I>[0]>> = {
		artist: (x) => x.__related.song.artist,
		title: (x) => x.__related.song.title,
		difficulty: (x) => x.__related.chart.difficulty,
		level: (x) => x.__related.chart.levelNum,
		score: (x) => x.scoreData.score,
		percent: (x) => x.scoreData.percent,
		highlight: (x) => !!x.highlight,
		lamp: {
			valueGetter: (x) => [x.scoreData.lamp, x.scoreData.lamp.index],
			strToNum: HumanFriendlyStrToLampIndex(game, playtype),
		},
		grade: {
			valueGetter: (x) => [x.scoreData.grade.string, x.scoreData.grade.string],
			strToNum: HumanFriendlyStrToGradeIndex(game, playtype),
		},
		...CreateCalcDataSearchFns(gptConfig),
	};

	if (game === "bms") {
		HandleBMSNonsense(searchFunctions, playtype, (k) => k.__related.chart);
	}

	return searchFunctions;
}

export function CreateDefaultPBSearchParams<GPT extends GPTString = GPTString>(
	game: Game,
	playtype: Playtype
) {
	const gptConfig = GetGamePTConfig(game, playtype);

	const searchFunctions: Record<string, ValueGetterOrHybrid<PBDataset<I>[0]>> = {
		artist: (x) => x.__related.song.artist,
		title: (x) => x.__related.song.title,
		difficulty: (x) => x.__related.chart.difficulty,
		level: (x) => x.__related.chart.levelNum,
		score: (x) => x.scoreData.score,
		percent: (x) => x.scoreData.percent,
		ranking: (x) => x.rankingData.rank,
		rivalRanking: (x) => x.rankingData.rivalRank,
		highlight: (x) => !!x.highlight,
		username: (x) => x.__related.user?.username ?? null,
		lamp: {
			valueGetter: (x) => [x.scoreData.lamp, x.scoreData.lamp.index],
			strToNum: HumanFriendlyStrToLampIndex(game, playtype),
		},
		grade: {
			valueGetter: (x) => [x.scoreData.grade.string, x.scoreData.grade.string],
			strToNum: HumanFriendlyStrToGradeIndex(game, playtype),
		},
		...CreateCalcDataSearchFns(gptConfig),
	};

	if (game === "bms") {
		HandleBMSNonsense(searchFunctions, playtype, (k) => k.__related.chart);
	}

	return searchFunctions;
}

export function CreatePBCompareSearchParams<GPT extends GPTString = GPTString>(
	game: Game,
	playtype: Playtype
) {
	const searchFunctions: Record<string, ValueGetterOrHybrid<ComparePBsDataset<I>[0]>> = {
		artist: (x) => x.song.artist,
		title: (x) => x.song.title,
		difficulty: (x) => x.chart.difficulty,
		level: (x) => x.chart.levelNum,
	};

	if (game === "bms") {
		HandleBMSNonsense(searchFunctions, playtype, (k) => k.chart);
	}

	return searchFunctions;
}

export function CreateDefaultFolderSearchParams<GPT extends GPTString = GPTString>(
	game: Game,
	playtype: Playtype
) {
	const gptConfig = GetGamePTConfig(game, playtype);

	const searchFunctions: Record<string, ValueGetterOrHybrid<FolderDataset<I>[0]>> = {
		artist: (x) => x.__related.song.artist,
		title: (x) => x.__related.song.title,
		difficulty: (x) => x.difficulty,
		level: (x) => x.levelNum,
		score: (x) => x.__related.pb?.scoreData.score ?? null,
		percent: (x) => x.__related.pb?.scoreData.percent ?? null,
		ranking: (x) => x.__related.pb?.rankingData.rank ?? null,
		rivalRanking: (x) => x.__related.pb?.rankingData.rivalRank ?? null,
		highlight: (x) => !!x.__related.pb?.highlight,
		played: (x) => !!x.__related.pb,
		lamp: {
			valueGetter: (x) =>
				x.__related.pb
					? [x.__related.pb.scoreData.lamp, x.__related.pb.scoreData.lamp.index]
					: null,
			strToNum: HumanFriendlyStrToLampIndex(game, playtype),
		},
		grade: {
			valueGetter: (x) =>
				x.__related.pb
					? [x.__related.pb.scoreData.grade.string, x.__related.pb.scoreData.grade.string]
					: null,
			strToNum: HumanFriendlyStrToGradeIndex(game, playtype),
		},
		...CreateFolderCalcDataSearchFns(gptConfig),
	};

	if (game === "bms") {
		HandleBMSNonsense(searchFunctions, playtype, (k) => k);
	}

	return searchFunctions;
}

function CreateFolderCalcDataSearchFns(gptConfig: GamePTConfig) {
	return Object.fromEntries(
		gptConfig.scoreRatingAlgs.map((e) => [
			e.toLowerCase(),
			(x: FolderDataset[0]) => x.__related.pb?.calculatedData[e] ?? null,
		])
	);
}

function CreateCalcDataSearchFns(gptConfig: GamePTConfig) {
	return Object.fromEntries(
		gptConfig.scoreRatingAlgs.map(
			(e) => [e.toLowerCase(), (x: PBDataset[0]) => x.calculatedData[e]] ?? null
		)
	);
}

/**
 * Add BMS tables to the list of available searchy things.
 */
function HandleBMSNonsense(
	searchFunctions: Record<string, any>,
	playtype: Playtype,
	chartGetter: (u: any) => ChartDocument<"bms:7K" | "bms:14K">
) {
	const appendSearches: Record<string, ValueGetterOrHybrid<any>> = Object.fromEntries(
		BMS_TABLES.filter((e) => e.playtype === playtype).map((e) => [
			e.asciiPrefix,
			(x) => GetBMSTableVal(chartGetter(x), e.prefix),
		])
	);

	Object.assign(searchFunctions, appendSearches);
}

import { ChartDocument, Game, GamePTConfig, GetGamePTConfig, IDStrings } from "tachi-common";
import { FolderDataset, PBDataset, ScoreDataset } from "types/tables";
import { Playtype } from "types/tachi";
import { BMS_TABLES } from "util/constants/bms-tables";
import { HumanFriendlyStrToGradeIndex, HumanFriendlyStrToLampIndex } from "util/str-to-num";
import { ValueGetterOrHybrid } from "util/ztable/search";

function GetBMSTableVal(chart: ChartDocument<"bms:7K" | "bms:14K">, key: string) {
	for (const table of chart.data.tableFolders) {
		if (table.table === key) {
			return Number(table.level);
		}
	}

	return null;
}

export function CreateDefaultScoreSearchParams<I extends IDStrings = IDStrings>(
	game: Game,
	playtype: Playtype
) {
	const gptConfig = GetGamePTConfig(game, playtype);

	const searchFunctions: Record<string, ValueGetterOrHybrid<ScoreDataset<I>[0]>> = {
		artist: x => x.__related.song.artist,
		title: x => x.__related.song.title,
		difficulty: x => x.__related.chart.difficulty,
		level: x => x.__related.chart.levelNum,
		score: x => x.scoreData.score,
		percent: x => x.scoreData.percent,
		highlight: x => !!x.highlight,
		lamp: {
			valueGetter: x => [x.scoreData.lamp, x.scoreData.lampIndex],
			strToNum: HumanFriendlyStrToLampIndex(game, playtype),
		},
		grade: {
			valueGetter: x => [x.scoreData.grade, x.scoreData.gradeIndex],
			strToNum: HumanFriendlyStrToGradeIndex(game, playtype),
		},
		...CreateCalcDataSearchFns(gptConfig),
	};

	if (game === "bms") {
		HandleBMSNonsense(searchFunctions, playtype, k => k.__related.chart);
	}

	return searchFunctions;
}

export function CreateDefaultPBSearchParams<I extends IDStrings = IDStrings>(
	game: Game,
	playtype: Playtype
) {
	const gptConfig = GetGamePTConfig(game, playtype);

	const searchFunctions: Record<string, ValueGetterOrHybrid<PBDataset<I>[0]>> = {
		artist: x => x.__related.song.artist,
		title: x => x.__related.song.title,
		difficulty: x => x.__related.chart.difficulty,
		level: x => x.__related.chart.levelNum,
		score: x => x.scoreData.score,
		percent: x => x.scoreData.percent,
		ranking: x => x.rankingData.rank,
		highlight: x => !!x.highlight,
		username: x => x.__related.user?.username ?? null,
		lamp: {
			valueGetter: x => [x.scoreData.lamp, x.scoreData.lampIndex],
			strToNum: HumanFriendlyStrToLampIndex(game, playtype),
		},
		grade: {
			valueGetter: x => [x.scoreData.grade, x.scoreData.gradeIndex],
			strToNum: HumanFriendlyStrToGradeIndex(game, playtype),
		},
		...CreateCalcDataSearchFns(gptConfig),
	};

	if (game === "bms") {
		HandleBMSNonsense(searchFunctions, playtype, k => k.__related.chart);
	}

	return searchFunctions;
}

export function CreateDefaultFolderSearchParams<I extends IDStrings = IDStrings>(
	game: Game,
	playtype: Playtype
) {
	const gptConfig = GetGamePTConfig(game, playtype);

	const searchFunctions: Record<string, ValueGetterOrHybrid<FolderDataset<I>[0]>> = {
		artist: x => x.__related.song.artist,
		title: x => x.__related.song.title,
		difficulty: x => x.difficulty,
		level: x => x.levelNum,
		score: x => x.__related.pb?.scoreData.score ?? -Infinity,
		percent: x => x.__related.pb?.scoreData.percent ?? -Infinity,
		ranking: x => x.__related.pb?.rankingData.rank ?? -Infinity,
		highlight: x => !!x.__related.pb?.highlight,
		played: x => !!x.__related.pb,
		lamp: {
			valueGetter: x =>
				x.__related.pb
					? [x.__related.pb.scoreData.lamp, x.__related.pb.scoreData.lampIndex]
					: null,
			strToNum: HumanFriendlyStrToLampIndex(game, playtype),
		},
		grade: {
			valueGetter: x =>
				x.__related.pb
					? [x.__related.pb.scoreData.grade, x.__related.pb.scoreData.gradeIndex]
					: null,
			strToNum: HumanFriendlyStrToGradeIndex(game, playtype),
		},
		...CreateFolderCalcDataSearchFns(gptConfig),
	};

	if (game === "bms") {
		HandleBMSNonsense(searchFunctions, playtype, k => k);
	}

	return searchFunctions;
}

function CreateFolderCalcDataSearchFns(gptConfig: GamePTConfig) {
	return Object.fromEntries(
		gptConfig.scoreRatingAlgs.map(e => [
			e.toLowerCase(),
			(x: FolderDataset[0]) => x.__related.pb?.calculatedData[e] ?? null,
		])
	);
}

function CreateCalcDataSearchFns(gptConfig: GamePTConfig) {
	return Object.fromEntries(
		gptConfig.scoreRatingAlgs.map(
			e => [e.toLowerCase(), (x: PBDataset[0]) => x.calculatedData[e]] ?? null
		)
	);
}

function HandleBMSNonsense(
	searchFunctions: Record<string, any>,
	playtype: Playtype,
	chartGetter: (u: any) => ChartDocument<"bms:7K" | "bms:14K">
) {
	const appendSearches: Record<string, ValueGetterOrHybrid<any>> =
		playtype === "7K"
			? {
					insane: x => GetBMSTableVal(chartGetter(x), BMS_TABLES.insane),
					overjoy: x => GetBMSTableVal(chartGetter(x), BMS_TABLES.overjoy),
					insane2: x => GetBMSTableVal(chartGetter(x), BMS_TABLES.insane2),
					normal: x => GetBMSTableVal(chartGetter(x), BMS_TABLES.normal),
					normal2: x => GetBMSTableVal(chartGetter(x), BMS_TABLES.normal2),
					st: x => GetBMSTableVal(chartGetter(x), BMS_TABLES.stella),
					sl: x => GetBMSTableVal(chartGetter(x), BMS_TABLES.satellite),
					satellite: x => GetBMSTableVal(chartGetter(x), BMS_TABLES.satellite),
					stella: x => GetBMSTableVal(chartGetter(x), BMS_TABLES.stella),
			  }
			: {
					insane: x => GetBMSTableVal(chartGetter(x), BMS_TABLES.dpInsane),
					normal: x => GetBMSTableVal(chartGetter(x), BMS_TABLES.dpNormal),
					sl: x => GetBMSTableVal(chartGetter(x), BMS_TABLES.satellite),
					satellite: x => GetBMSTableVal(chartGetter(x), BMS_TABLES.satellite),
			  };

	Object.assign(searchFunctions, appendSearches);
}

import { FormatCGService } from "../util";
import {
	InternalFailure,
	InvalidScoreFailure,
	SkipScoreFailure,
	SongOrChartNotFoundFailure,
} from "lib/score-import/framework/common/converter-failures";
import { ParseDateFromString } from "lib/score-import/framework/common/score-utils";
import { FindChartOnInGameIDVersion } from "utils/queries/charts";
import { FindSongOnID } from "utils/queries/songs";
import type { ConverterFunction } from "../../types";
import type { CGContext, CGPopnScore } from "../types";
import type { DryScore } from "lib/score-import/framework/common/types";
import type { Difficulties, Versions, integer } from "tachi-common";
import type { GetEnumValue } from "tachi-common/types/metrics";

export const ConverterAPICGPopn: ConverterFunction<CGPopnScore, CGContext> = async (
	data,
	context,
	importType,
	logger
) => {
	const difficulty = ConvertDifficulty(data.difficulty);
	const version = ConvertVersion(data.version);

	if (data.score > 100_000) {
		throw new InvalidScoreFailure(`Score is > 100_000 (got ${data.score})`);
	}

	const chart = await FindChartOnInGameIDVersion(
		"popn",
		data.internalId,
		"9B",
		difficulty,
		version
	);

	if (!chart) {
		throw new SongOrChartNotFoundFailure(
			`Could not find chart with songID ${data.internalId} (${difficulty} - Version ${version})`,
			importType,
			data,
			context
		);
	}

	const song = await FindSongOnID("popn", chart.songID);

	if (!song) {
		logger.severe(`Song-Chart desync with song ID ${chart.songID} (popn).`);
		throw new InternalFailure(`Song-Chart desync with song ID ${chart.songID} (popn).`);
	}

	const clearMedal = GetClearMedal(data.clearFlag);

	const timeAchieved = ParseDateFromString(data.dateTime);

	const dryScore: DryScore<"popn:9B"> = {
		comment: null,
		game: "popn",
		importType,
		timeAchieved,
		service: FormatCGService(context.service),
		scoreData: {
			score: data.score,
			clearMedal,
			judgements: {
				cool: data.coolCount,
				great: data.greatCount,
				good: data.goodCount,
				bad: data.badCount,
			},
			optional: {},
		},
		scoreMeta: {},
	};

	return { song, chart, dryScore };
};

function ConvertDifficulty(diff: number): Difficulties["popn:9B"] {
	switch (diff) {
		case 0:
			return "Easy";
		case 1:
			return "Normal";
		case 2:
			return "Hyper";
		case 3:
			return "EX";
		case 4:
		case 5:
			throw new SkipScoreFailure("Battle Mode scores are not supported!");
	}

	throw new InvalidScoreFailure(`Invalid difficulty of ${diff} - Could not convert.`);
}

function ConvertVersion(ver: number): Versions["popn:9B"] {
	switch (ver) {
		case 27:
			return "unilab";
		case 26:
			return "kaimei";
		case 25:
			return "peace";
	}

	throw new InvalidScoreFailure(`Unknown/Unsupported Game Version ${ver}.`);
}

function GetClearMedal(clearFlag: integer): GetEnumValue<"popn:9B", "clearMedal"> {
	switch (clearFlag) {
		case 1:
			return "failedCircle";
		case 2:
			return "failedDiamond";
		case 3:
			return "failedStar";
		case 4:
			return "easyClear";
		case 5:
			return "clearCircle";
		case 6:
			return "clearDiamond";
		case 7:
			return "clearStar";
		case 8:
			return "fullComboCircle";
		case 9:
			return "fullComboDiamond";
		case 10:
			return "fullComboStar";
		case 11:
			return "perfect";
	}

	throw new InvalidScoreFailure(`Invalid/unexpected clearMedal of ${clearFlag}.`);
}

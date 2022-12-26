import { FormatCGService } from "../util";
import {
	InternalFailure,
	InvalidScoreFailure,
	SongOrChartNotFoundFailure,
} from "lib/score-import/framework/common/converter-failures";
import {
	GenericGetGradeAndPercent,
	ParseDateFromString,
} from "lib/score-import/framework/common/score-utils";
import { FindSDVXChartOnInGameIDVersion } from "utils/queries/charts";
import { FindSongOnID } from "utils/queries/songs";
import type { ConverterFunction } from "../../types";
import type { CGContext, CGSDVXScore } from "../types";
import type { DryScore } from "lib/score-import/framework/common/types";
import type { GPTSupportedVersions, Lamps } from "tachi-common";

export const ConverterAPICGSDVX: ConverterFunction<CGSDVXScore, CGContext> = async (
	data,
	context,
	importType,
	logger
) => {
	const difficulty = ConvertDifficulty(data.difficulty);
	const version = ConvertVersion(data.version);

	const chart = await FindSDVXChartOnInGameIDVersion(data.internalId, difficulty, version);

	if (!chart) {
		throw new SongOrChartNotFoundFailure(
			`Could not find chart with songID ${data.internalId} (${difficulty} - Version ${version})`,
			importType,
			data,
			context
		);
	}

	const song = await FindSongOnID("sdvx", chart.songID);

	if (!song) {
		logger.severe(`Song-Chart desync with song ID ${chart.songID} (sdvx).`);
		throw new InternalFailure(`Song-Chart desync with song ID ${chart.songID} (sdvx).`);
	}

	const lamp = ConvertCGSDVXLamp(data.clearType);

	const { percent, grade } = GenericGetGradeAndPercent("sdvx", data.score, chart);

	const timeAchieved = ParseDateFromString(data.dateTime);

	const dryScore: DryScore<"sdvx:Single"> = {
		comment: null,
		game: "sdvx",
		importType,
		timeAchieved,
		service: FormatCGService(context.service),
		scoreData: {
			grade,
			percent,
			score: data.score,
			lamp,
			judgements: {
				critical: data.critical,
				near: data.near,
				miss: data.error,
			},
			hitMeta: {
				maxCombo: data.maxChain,
			},
		},
		scoreMeta: {},
	};

	return { song, chart, dryScore };
};

function ConvertDifficulty(diff: number) {
	switch (diff) {
		case 0:
			return "NOV";
		case 1:
			return "ADV";
		case 2:
			return "EXH";
		case 3:
			return "ANY_INF";
		case 4:
			return "MXM";
	}

	throw new InvalidScoreFailure(`Invalid difficulty of ${diff} - Could not convert.`);
}

function ConvertVersion(ver: number): GPTSupportedVersions["sdvx:Single"] {
	switch (ver) {
		case 1:
			return "booth";
		case 2:
			return "inf";
		case 3:
			return "gw";
		case 4:
			return "heaven";
		case 5:
			return "vivid";
		case 6:
			return "exceed";
	}

	throw new InvalidScoreFailure(`Unknown Game Version ${ver}.`);
}

/**
 * Convert CG's clearType enum into a Tachi lamp. Note that what numbers mean what are
 * dependent on what version of the game we're listening for.
 */
function ConvertCGSDVXLamp(clearType: number): Lamps["sdvx:Single"] {
	switch (clearType) {
		case 1:
			return "FAILED";
		case 2:
			return "CLEAR";
		case 3:
			return "EXCESSIVE CLEAR";
		case 4:
			return "ULTIMATE CHAIN";
		case 5:
			return "PERFECT ULTIMATE CHAIN";
	}

	throw new InvalidScoreFailure(`Invalid lamp of ${clearType} - Could not convert.`);
}

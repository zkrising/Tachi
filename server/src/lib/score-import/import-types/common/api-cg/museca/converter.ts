import { FormatCGService } from "../util";
import {
	InternalFailure,
	InvalidScoreFailure,
	KTDataNotFoundFailure,
} from "lib/score-import/framework/common/converter-failures";
import {
	GenericGetGradeAndPercent,
	MusecaGetLamp,
	ParseDateFromString,
} from "lib/score-import/framework/common/score-utils";
import { FindChartOnInGameIDVersion } from "utils/queries/charts";
import { FindSongOnID } from "utils/queries/songs";
import type { ConverterFunction } from "../../types";
import type { CGContext, CGMusecaScore } from "../types";
import type { DryScore } from "lib/score-import/framework/common/types";
import type { Difficulties, GPTSupportedVersions } from "tachi-common";

export const ConverterAPICGMuseca: ConverterFunction<CGMusecaScore, CGContext> = async (
	data,
	context,
	importType,
	logger
) => {
	const difficulty = ConvertDifficulty(data.difficulty);
	const version = ConvertVersion(data.version);

	const chart = await FindChartOnInGameIDVersion(
		"museca",
		data.internalId,
		"Single",
		difficulty,
		version
	);

	if (!chart) {
		throw new KTDataNotFoundFailure(
			`Could not find chart with songID ${data.internalId} (${difficulty} - Version ${version})`,
			importType,
			data,
			context
		);
	}

	const song = await FindSongOnID("museca", chart.songID);

	if (!song) {
		logger.severe(`Song-Chart desync with song ID ${chart.songID} (museca).`);
		throw new InternalFailure(`Song-Chart desync with song ID ${chart.songID} (museca).`);
	}

	const lamp = MusecaGetLamp(data.score, data.error);

	const { percent, grade } = GenericGetGradeAndPercent("museca", data.score, chart);

	const timeAchieved = ParseDateFromString(data.dateTime);

	const dryScore: DryScore<"museca:Single"> = {
		comment: null,
		game: "museca",
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

function ConvertDifficulty(diff: number): Difficulties["museca:Single"] {
	switch (diff) {
		case 0:
			return "Green";
		case 1:
			return "Yellow";
		case 2:
			return "Red";
	}

	throw new InvalidScoreFailure(`Invalid difficulty of ${diff} - Could not convert.`);
}

function ConvertVersion(ver: number): GPTSupportedVersions["museca:Single"] {
	switch (ver) {
		case 1:
			return "1.5-b";
	}

	throw new InvalidScoreFailure(`Unknown/Unsupported Game Version ${ver}.`);
}

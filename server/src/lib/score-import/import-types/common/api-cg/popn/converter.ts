import {
	InternalFailure,
	InvalidScoreFailure,
	KTDataNotFoundFailure,
} from "lib/score-import/framework/common/converter-failures";
import {
	GenericGetGradeAndPercent,
	ParseDateFromString,
} from "lib/score-import/framework/common/score-utils";
import { FindChartOnInGameIDVersion } from "utils/queries/charts";
import { FindSongOnID } from "utils/queries/songs";
import type { ConverterFunction } from "../../types";
import type { CGContext, CGPopnScore } from "../types";
import type { DryScore } from "lib/score-import/framework/common/types";
import type {
	Difficulties,
	GPTSupportedVersions,
	HitMetaLookup,
	Lamps,
	integer,
} from "tachi-common";

export const ConverterAPICGPopn: ConverterFunction<CGPopnScore, CGContext> = async (
	data,
	context,
	importType,
	logger
) => {
	const difficulty = ConvertDifficulty(data.difficulty);
	const version = ConvertVersion(data.version);

	const chart = await FindChartOnInGameIDVersion(
		"popn",
		data.internalId,
		"9B",
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

	const song = await FindSongOnID("popn", chart.songID);

	if (!song) {
		logger.severe(`Song-Chart desync with song ID ${chart.songID} (popn).`);
		throw new InternalFailure(`Song-Chart desync with song ID ${chart.songID} (popn).`);
	}

	const lamp = GetLamp(data.clearFlag);
	const specificClearType = GetSpecificClearMedal(data.clearFlag);

	const gradeAndPercent = GenericGetGradeAndPercent("popn", data.score, chart);
	const percent = gradeAndPercent.percent; // ugly declarations because one is const
	// and the other isn't...
	let grade = gradeAndPercent.grade;

	// TEMP HACK: TODO MOVE THIS TO COMMON SOMEHOW
	// pop'n scores are capped at an A rank if they're fails.
	if (lamp === "FAILED" && percent >= 90) {
		grade = "A";
	}

	const timeAchieved = ParseDateFromString(data.dateTime);

	const dryScore: DryScore<"popn:9B"> = {
		comment: null,
		game: "popn",
		importType,
		timeAchieved,
		service: context.service,
		scoreData: {
			grade,
			percent,
			score: data.score,
			lamp,
			judgements: {
				cool: data.coolCount,
				great: data.greatCount,
				good: data.goodCount,
				bad: data.badCount,
			},
			hitMeta: {
				specificClearType,
			},
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
	}

	throw new InvalidScoreFailure(`Invalid difficulty of ${diff} - Could not convert.`);
}

function ConvertVersion(ver: number): GPTSupportedVersions["popn:9B"] {
	switch (ver) {
		case 26:
			return "kaimei";
		case 25:
			return "peace";
	}

	throw new InvalidScoreFailure(`Unknown/Unsupported Game Version ${ver}.`);
}

function GetLamp(clearFlag: integer): Lamps["popn:9B"] {
	if (clearFlag === 11) {
		return "PERFECT";
	} else if (clearFlag >= 8) {
		return "FULL COMBO";
	} else if (clearFlag >= 5) {
		return "CLEAR";
	} else if (clearFlag === 4) {
		return "EASY CLEAR";
	}

	return "FAILED";
}

function GetSpecificClearMedal(clearFlag: integer): HitMetaLookup["popn:9B"]["specificClearType"] {
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

	// no idea.
	return null;
}

import { EmptyObject } from "../../../../../utils/types";
import { ConverterFunction } from "../../common/types";
import p, { PrudenceSchema } from "prudence";
import {
	InvalidScoreFailure,
	KTDataNotFoundFailure,
} from "../../../framework/common/converter-failures";
import { FormatPrError } from "../../../../../utils/prudence";
import { ARCSDVXScore } from "./types";
import { FindChartOnARCID } from "../../../../../utils/queries/charts";
import { FindSongOnIDGuaranteed } from "../../../../../utils/queries/songs";
import { DryScore } from "../../../framework/common/types";
import {
	GenericGetGradeAndPercent,
	ParseDateFromString,
} from "../../../framework/common/score-utils";
import { Lamps } from "tachi-common";

// There's a bunch of other useless fields but we don't care
const PR_ArcSDVXScore: PrudenceSchema = {
	chart_id: "string",
	score: p.isBoundedInteger(0, 10_000_000),
	lamp: p.isIn("UC", "PUC", "HC", "PLAY", "CLEAR"),
	btn_rate: p.isBetween(0, 100),
	long_rate: p.isBetween(0, 100),
	vol_rate: p.isBetween(0, 100),
	critical: p.isPositiveInteger,
	near: p.isPositiveInteger,
	error: p.isPositiveInteger,
	timestamp: "string",
};

export const ConvertAPIArcSDVX: ConverterFunction<unknown, EmptyObject> = async (
	data,
	context,
	importType,
	logger
) => {
	const err = p(data, PR_ArcSDVXScore, {}, { throwOnNonObject: false, allowExcessKeys: true });

	if (err) {
		throw new InvalidScoreFailure(FormatPrError(err, "Invalid ARC Score: "));
	}

	// confirmed by Prudence above.
	const score = data as ARCSDVXScore;

	const chart = await FindChartOnARCID("sdvx", score.chart_id);

	if (!chart) {
		throw new KTDataNotFoundFailure(
			`Could not find chart with chart_id ${score.chart_id}.`,
			importType,
			data,
			context
		);
	}

	const song = await FindSongOnIDGuaranteed("sdvx", chart.songID, logger);

	const { grade, percent } = GenericGetGradeAndPercent("sdvx", score.score, chart);

	const timeAchieved = ParseDateFromString(score.timestamp);

	const lamp = ResolveARCSDVXLamp(score.lamp);

	const dryScore: DryScore<"sdvx:Single"> = {
		comment: null,
		game: "sdvx",
		importType,
		timeAchieved,
		service: "ARC SDVX V",
		scoreData: {
			grade,
			percent,
			score: score.score,
			hitData: {
				critical: score.critical,
				near: score.near,
				miss: score.error,
			},
			hitMeta: {
				btnRate: score.btn_rate,
				holdRate: score.long_rate,
				laserRate: score.vol_rate,
				maxCombo: score.max_chain,
			},
			lamp,
		},
		scoreMeta: {},
	};

	return { song, chart, dryScore };
};

/**
 * ARC has a bug where all sdvx scores are clears no matter what.
 * This function takes the score and lamp and rederives the lamp.
 */
export function ResolveARCSDVXLamp(lamp: ARCSDVXScore["lamp"]): Lamps["sdvx:Single"] {
	switch (lamp) {
		case "PLAY":
			return "FAILED";
		case "CLEAR":
			return "CLEAR";
		case "HC":
			return "EXCESSIVE CLEAR";
		case "UC":
			return "ULTIMATE CHAIN";
		case "PUC":
			return "PERFECT ULTIMATE CHAIN";
	}

	throw new InvalidScoreFailure(`Invalid lamp ${lamp} - Could not convert.`);
}

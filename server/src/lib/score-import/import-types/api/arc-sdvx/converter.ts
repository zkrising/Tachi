import {
	InvalidScoreFailure,
	KTDataNotFoundFailure,
} from "../../../framework/common/converter-failures";
import {
	GenericGetGradeAndPercent,
	ParseDateFromString,
} from "../../../framework/common/score-utils";
import p from "prudence";
import { FormatPrError } from "utils/prudence";
import { FindChartOnARCID } from "utils/queries/charts";
import { FindSongOnIDGuaranteed } from "utils/queries/songs";
import type { DryScore } from "../../../framework/common/types";
import type { ConverterFunction } from "../../common/types";
import type { ARCSDVXScore } from "./types";
import type { PrudenceSchema } from "prudence";
import type { Lamps } from "tachi-common";
import type { EmptyObject } from "utils/types";

// There's a bunch of other useless fields but we don't care
const PR_ARC_SDVX_SCORE: PrudenceSchema = {
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
	const err = p(data, PR_ARC_SDVX_SCORE, {}, { throwOnNonObject: false, allowExcessKeys: true });

	if (err) {
		throw new InvalidScoreFailure(FormatPrError(err, "Invalid ARC Score: "));
	}

	// @ts-expect-error ARC sends over _id tags in their data, which may be saved into
	// mongoDB.
	// Our monk driver recursively tries to convert `_id` keys into being ObjectIDs
	// which may not be possible. As such, it will throw an error if _id exists anywhere
	// in an object.
	delete data._id;

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
			judgements: {
				critical: score.critical,
				near: score.near,
				miss: score.error,
			},
			hitMeta: {
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
}

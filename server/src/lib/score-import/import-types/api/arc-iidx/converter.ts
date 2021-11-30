/* eslint-disable @typescript-eslint/no-explicit-any */
import p, { PrudenceSchema } from "prudence";
import { Lamps } from "tachi-common";
import { FormatPrError } from "utils/prudence";
import { FindChartOnARCID } from "utils/queries/charts";
import { FindSongOnIDGuaranteed } from "utils/queries/songs";
import { EmptyObject } from "utils/types";
import {
	InvalidScoreFailure,
	KTDataNotFoundFailure,
} from "../../../framework/common/converter-failures";
import {
	GenericGetGradeAndPercent,
	ParseDateFromString,
} from "../../../framework/common/score-utils";
import { DryScore } from "../../../framework/common/types";
import { ConverterFunction } from "../../common/types";
import { ARCIIDXScore } from "./types";

// There's a bunch of other useless fields but we don't care
const PR_ArcIIDXScore: PrudenceSchema = {
	chart_id: "string",
	lamp: p.isIn(
		"FULL_COMBO",
		"EX_HARD_CLEAR",
		"HARD_CLEAR",
		"CLEAR",
		"EASY_CLEAR",
		"ASSIST_CLEAR",
		"FAILED",
		"NO_PLAY"
	),
	ex_score: p.isPositiveInteger,
	miss_count: p.nullable(p.isPositiveInteger),
	timestamp: "string",
};

export const ConvertAPIArcIIDX: ConverterFunction<unknown, EmptyObject> = async (
	data,
	context,
	importType,
	logger
) => {
	const err = p(data, PR_ArcIIDXScore, {}, { throwOnNonObject: false, allowExcessKeys: true });

	if (err) {
		throw new InvalidScoreFailure(FormatPrError(err, "Invalid ARC Score: "));
	}

	// Remove internal properties.
	delete (data as any)._links;
	delete (data as any)._etag;
	// Most importantly, this one will cause crashes.
	delete (data as any)._id;

	// confirmed by Prudence above.
	const score = data as ARCIIDXScore;

	const chart = await FindChartOnARCID("iidx", score.chart_id);

	if (!chart) {
		throw new KTDataNotFoundFailure(
			`Could not find chart with chart_id ${score.chart_id}.`,
			importType,
			data,
			context
		);
	}

	const song = await FindSongOnIDGuaranteed("iidx", chart.songID, logger);

	const { grade, percent } = GenericGetGradeAndPercent("iidx", score.ex_score, chart);

	const timeAchieved = ParseDateFromString(score.timestamp);

	const lamp = ResolveARCIIDXLamp(score.lamp);

	const dryScore: DryScore<"iidx:SP" | "iidx:DP"> = {
		comment: null,
		game: "iidx",
		importType,
		timeAchieved,
		service: "ARC IIDX28",
		scoreData: {
			grade,
			percent,
			score: score.ex_score,
			judgements: {},
			hitMeta: {
				bp: score.miss_count,
			},
			lamp,
		},
		scoreMeta: {},
	};

	return { song, chart, dryScore };
};

export function ResolveARCIIDXLamp(lamp: ARCIIDXScore["lamp"]): Lamps["iidx:SP" | "iidx:DP"] {
	switch (lamp) {
		case "NO_PLAY":
			return "NO PLAY";
		case "FAILED":
			return "FAILED";
		case "ASSIST_CLEAR":
			return "ASSIST CLEAR";
		case "EASY_CLEAR":
			return "EASY CLEAR";
		case "CLEAR":
			return "CLEAR";
		case "HARD_CLEAR":
			return "HARD CLEAR";
		case "EX_HARD_CLEAR":
			return "EX HARD CLEAR";
		case "FULL_COMBO":
			return "FULL COMBO";
	}
}

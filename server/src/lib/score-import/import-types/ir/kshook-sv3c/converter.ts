import { FindSDVXChartOnInGameIDVersion } from "utils/queries/charts";
import { EmptyObject } from "utils/types";
import { ConverterFunction } from "../../common/types";
import { KsHookSV3CScore } from "./types";
import { Lamps } from "tachi-common";
import {
	InternalFailure,
	KTDataNotFoundFailure,
} from "lib/score-import/framework/common/converter-failures";
import { FindSongOnID } from "utils/queries/songs";
import { GenericGetGradeAndPercent } from "lib/score-import/framework/common/score-utils";
import { DryScore } from "lib/score-import/framework/common/types";

export const ConverterIRKsHookSV3C: ConverterFunction<KsHookSV3CScore, EmptyObject> = async (
	data,
	context,
	importType,
	logger
) => {
	const diff = ConvertDifficulty(data.difficulty);

	const chart = await FindSDVXChartOnInGameIDVersion(data.music_id, diff, "konaste");

	if (!chart) {
		throw new KTDataNotFoundFailure(
			`Could not find chart with songID ${data.music_id} (${diff} for Konaste).`,
			importType,
			data,
			context
		);
	}

	const song = await FindSongOnID("sdvx", chart.songID);

	if (!song) {
		logger.severe(`Song ${chart.songID} (sdvx) has no parent song?`);
		throw new InternalFailure(`Song ${chart.songID} (sdvx) has no parent song?`);
	}

	const { percent, grade } = GenericGetGradeAndPercent("sdvx", data.score, chart);

	const dryScore: DryScore<"sdvx:Single"> = {
		game: "sdvx",
		service: "kshook SV3C",
		comment: null,
		importType: "ir/kshook-sv3c",
		timeAchieved: Date.now(),
		scoreData: {
			score: data.score,
			percent,
			grade,
			lamp: ConvertLamp(data.clear),
			judgements: {
				critical: data.critical,
				near: data.near,
				miss: data.error,
			},
			hitMeta: {
				fast: data.early,
				slow: data.late,
				gauge: data.gauge,
				maxCombo: data.max_chain,
			},
		},
		scoreMeta: {},
	};

	return { song, chart, dryScore };
};

function ConvertLamp(clear: KsHookSV3CScore["clear"]): Lamps["sdvx:Single"] {
	if (clear === "CLEAR_PLAYED") {
		return "FAILED";
	} else if (clear === "CLEAR_EFFECTIVE") {
		return "CLEAR";
	} else if (clear === "CLEAR_EXCESSIVE") {
		return "EXCESSIVE CLEAR";
	} else if (clear === "CLEAR_ULTIMATE_CHAIN") {
		return "ULTIMATE CHAIN";
	}

	return "PERFECT ULTIMATE CHAIN";
}

function ConvertDifficulty(
	diff: KsHookSV3CScore["difficulty"]
): "NOV" | "ADV" | "EXH" | "ANY_INF" | "MXM" {
	if (diff === "DIFFICULTY_NOVICE") {
		return "NOV";
	} else if (diff === "DIFFICULTY_ADVANCED") {
		return "ADV";
	} else if (diff === "DIFFICULTY_EXHAUST") {
		return "EXH";
	} else if (diff === "DIFFICULTY_INFINITE") {
		return "ANY_INF";
	}

	return "MXM";
}

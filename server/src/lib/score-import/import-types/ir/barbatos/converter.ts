import { Lamps } from "tachi-common";
import { FindSDVXChartOnInGameID } from "utils/queries/charts";
import { FindSongOnID } from "utils/queries/songs";
import {
	InternalFailure,
	KTDataNotFoundFailure,
} from "../../../framework/common/converter-failures";
import { GenericGetGradeAndPercent } from "../../../framework/common/score-utils";
import { DryScore } from "../../../framework/common/types";
import { ConverterFunction } from "../../common/types";
import { BarbatosContext, BarbatosScore } from "./types";

const LAMP_LOOKUP = {
	1: "FAILED",
	2: "CLEAR",
	3: "EXCESSIVE CLEAR",
	4: "ULTIMATE CHAIN",
	5: "PERFECT ULTIMATE CHAIN",
};

const DIFFICULTY_LOOKUP = {
	0: "NOV",
	1: "ADV",
	2: "EXH",
	3: "ANY_INF", // special case for inf/grv/hvn/vvd - which are all the same diff internally. (kinda).
	4: "MXM",
};

export const ConverterIRBarbatos: ConverterFunction<BarbatosScore, BarbatosContext> = async (
	data,
	context,
	importType,
	logger
) => {
	const difficulty = DIFFICULTY_LOOKUP[data.difficulty] as
		| "NOV"
		| "ADV"
		| "EXH"
		| "ANY_INF"
		| "MXM";

	const chart = await FindSDVXChartOnInGameID(data.song_id, difficulty);

	if (!chart) {
		throw new KTDataNotFoundFailure(
			`Could not find chart with songID ${data.song_id} (${difficulty})`,
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
		service: "Barbatos",
		comment: null,
		importType: "ir/barbatos",
		timeAchieved: context.timeReceived,
		scoreData: {
			score: data.score,
			percent,
			grade,
			lamp: LAMP_LOOKUP[data.clear_type] as Lamps["sdvx:Single"],
			judgements: {
				critical: data.critical,
				near: data.near_total,
				miss: data.error,
			},
			hitMeta: {
				fast: data.near_fast,
				slow: data.near_slow,
				gauge: data.percent,
				maxCombo: data.max_chain,
			},
		},
		scoreMeta: {
			inSkillAnalyser: data.is_skill_analyzer,
		},
	};

	return { song, chart, dryScore };
};

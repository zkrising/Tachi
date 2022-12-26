import {
	InternalFailure,
	SongOrChartNotFoundFailure,
} from "../../../framework/common/converter-failures";
import { GenericGetGradeAndPercent } from "../../../framework/common/score-utils";
import { FindSDVXChartOnInGameIDVersion } from "utils/queries/charts";
import { FindSongOnID } from "utils/queries/songs";
import type { DryScore } from "../../../framework/common/types";
import type { ConverterFunction } from "../../common/types";
import type { BarbatosContext, BarbatosScore, BarbatosSDVX6Score } from "./types";
import type { Lamps } from "tachi-common";

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

	// special case for inf/grv/hvn/vvd - which are all the same diff internally. (kinda).
	3: "ANY_INF",
	4: "MXM",
};

export const ConverterIRBarbatos: ConverterFunction<
	BarbatosScore | BarbatosSDVX6Score,
	BarbatosContext
> = async (data, context, importType, logger) => {
	const difficulty = DIFFICULTY_LOOKUP[data.difficulty] as
		| "ADV"
		| "ANY_INF"
		| "EXH"
		| "MXM"
		| "NOV";

	const chart = await FindSDVXChartOnInGameIDVersion(data.song_id, difficulty, context.version);

	if (!chart) {
		throw new SongOrChartNotFoundFailure(
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

	const { critical, near, miss } = GetJudgements(data);
	const { fast, slow } = GetFastSlow(data);

	const dryScore: DryScore<"sdvx:Single"> = {
		game: "sdvx",
		service: `Barbatos (${context.version})`,
		comment: null,
		importType: "ir/barbatos",
		timeAchieved: context.timeReceived,
		scoreData: {
			score: data.score,
			percent,
			grade,
			lamp: LAMP_LOOKUP[data.clear_type] as Lamps["sdvx:Single"],
			judgements: {
				critical,
				near,
				miss,
			},
			hitMeta: {
				fast,
				slow,
				gauge: data.percent,
				maxCombo: data.max_chain,

				// only sdvx6 scores store this info
				exScore: "ex_score" in data ? data.ex_score : null,
			},
		},
		scoreMeta: {
			// for some reason, only sdvx5 scores store this info.
			inSkillAnalyser: "is_skill_analyzer" in data ? data.is_skill_analyzer : null,
		},
	};

	return { song, chart, dryScore };
};

function GetJudgements(data: BarbatosScore | BarbatosSDVX6Score) {
	if ("ex_score" in data) {
		// this is a sdvx6 score.

		return {
			critical: data.early_crit + data.s_crit + data.late_crit,
			near: data.chip_near,
			miss: data.early_error + data.late_error,
		};
	}

	// otherwise, normal score
	return {
		critical: data.critical,
		near: data.near_total,
		miss: data.error,
	};
}

function GetFastSlow(data: BarbatosScore | BarbatosSDVX6Score) {
	if ("ex_score" in data) {
		return {
			fast: data.early_near,
			slow: data.late_near,
		};
	}

	return {
		fast: data.near_fast,
		slow: data.near_slow,
	};
}

import { FindSongOnID } from "../../../../../utils/queries/songs";
import { GenericGetGradeAndPercent } from "../../../framework/common/score-utils";
import {
	InternalFailure,
	InvalidScoreFailure,
	KTDataNotFoundFailure,
} from "../../../framework/common/converter-failures";
import { FervidexContext, FervidexScore } from "./types";
import { Lamps, Difficulties, Playtypes } from "tachi-common";
import {
	FindIIDXChartOnInGameIDVersion,
	FindIIDXChartWith2DXtraHash,
} from "../../../../../utils/queries/charts";
import { ConverterFunction } from "../../common/types";
import { DryScore } from "../../../framework/common/types";

export const FERVIDEX_LAMP_LOOKUP = {
	0: "NO PLAY",
	1: "FAILED",
	2: "ASSIST CLEAR",
	3: "EASY CLEAR",
	4: "CLEAR",
	5: "HARD CLEAR",
	6: "EX HARD CLEAR",
	7: "FULL COMBO",
};

export function TachifyAssist(
	assist: FervidexScore["option"]["assist"]
): DryScore<"iidx:SP" | "iidx:DP">["scoreMeta"]["assist"] {
	switch (assist) {
		case "ASCR_LEGACY":
			return "FULL ASSIST";
		case "AUTO_SCRATCH":
			return "AUTO SCRATCH";
		case "FULL_ASSIST":
			return "FULL ASSIST";
		case "LEGACY_NOTE":
			return "LEGACY NOTE";
		case null:
		case undefined:
			return "NO ASSIST";
	}
}

export function TachifyGauge(
	gauge: FervidexScore["option"]["gauge"]
): DryScore<"iidx:SP" | "iidx:DP">["scoreMeta"]["gauge"] {
	switch (gauge) {
		case "ASSISTED_EASY":
			return "ASSISTED EASY";
		case "EASY":
			return "EASY";
		case "EX_HARD":
			return "EX HARD";
		case "HARD":
			return "HARD";
		case null:
		case undefined:
			return "NORMAL";
	}
}

export function TachifyRange(
	gauge: FervidexScore["option"]["range"]
): DryScore<"iidx:SP" | "iidx:DP">["scoreMeta"]["range"] {
	switch (gauge) {
		case "HIDDEN_PLUS":
			return "HIDDEN+";
		case "LIFT":
			return "LIFT";
		case "LIFT_SUD_PLUS":
			return "LIFT SUD+";
		case "SUDDEN_PLUS":
			return "SUDDEN+";
		case "SUD_PLUS_HID_PLUS":
			return "SUD+ HID+";
		case null:
		case undefined:
			return "NONE";
	}
}

export function TachifyRandom(
	gauge: FervidexScore["option"]["style"]
): DryScore<"iidx:SP" | "iidx:DP">["scoreMeta"]["random"] {
	switch (gauge) {
		case "RANDOM":
			return "RANDOM";
		case "S_RANDOM":
			return "S-RANDOM";
		case "R_RANDOM":
			return "R-RANDOM";
		case "MIRROR":
			return "MIRROR";
		case null:
		case undefined:
			return "NONRAN";
	}
}

export function SplitFervidexChartRef(ferDif: FervidexScore["chart"]) {
	let playtype: Playtypes["iidx"];
	if (ferDif.startsWith("sp")) {
		playtype = "SP";
	} else {
		playtype = "DP";
	}

	let difficulty: Difficulties["iidx:SP" | "iidx:DP"];

	switch (ferDif[ferDif.length - 1]) {
		case "b":
			difficulty = "BEGINNER";
			break;
		case "n":
			difficulty = "NORMAL";
			break;
		case "h":
			difficulty = "HYPER";
			break;
		case "a":
			difficulty = "ANOTHER";
			break;
		case "l":
			difficulty = "LEGGENDARIA";
			break;
		default:
			throw new InternalFailure(`Invalid fervidex difficulty of ${ferDif}`);
	}

	return { playtype, difficulty };
}

export const ConverterIRFervidex: ConverterFunction<FervidexScore, FervidexContext> = async (
	data,
	context,
	importType,
	logger
) => {
	const { difficulty, playtype } = SplitFervidexChartRef(data.chart);

	let chart;
	if (data.custom) {
		chart = await FindIIDXChartWith2DXtraHash(data.chart_sha256);
	} else {
		chart = await FindIIDXChartOnInGameIDVersion(
			data.entry_id,
			playtype,
			difficulty,
			context.version
		);
	}

	if (!chart) {
		throw new KTDataNotFoundFailure(
			`Could not find chart with songID ${data.entry_id} (${playtype} ${difficulty} [${context.version}])`,
			importType,
			data,
			context
		);
	}

	const song = await FindSongOnID("iidx", chart.songID);

	if (!song) {
		logger.severe(`Song ${chart.songID} (iidx) has no parent song?`);
		throw new InternalFailure(`Song ${chart.songID} (iidx) has no parent song?`);
	}

	const gaugeHistory = data.gauge.map((e) => (e > 200 ? null : e));

	const gauge = gaugeHistory[gaugeHistory.length - 1];

	if (gauge && gauge > 100) {
		throw new InvalidScoreFailure(`Invalid value of gauge ${gauge}.`);
	}

	const { percent, grade } = GenericGetGradeAndPercent("iidx", data.ex_score, chart);

	const dryScore: DryScore<"iidx:SP" | "iidx:DP"> = {
		game: "iidx",
		service: "Fervidex",
		comment: null,
		importType: "ir/fervidex",
		timeAchieved: Date.now(),
		scoreData: {
			score: data.ex_score,
			percent,
			grade,
			lamp: FERVIDEX_LAMP_LOOKUP[data.clear_type] as Lamps["iidx:SP" | "iidx:DP"],
			judgements: {
				pgreat: data.pgreat,
				great: data.great,
				good: data.good,
				bad: data.bad,
				poor: data.poor,
			},
			hitMeta: {
				fast: data.fast,
				slow: data.slow,
				maxCombo: data.max_combo,
				gaugeHistory,
				scoreHistory: data.ghost,
				gauge,
				bp: data.bad + data.poor,
				comboBreak: data.combo_break,
				gsm: data["2dx-gsm"],
			},
		},
		scoreMeta: {
			assist: TachifyAssist(data.option.assist),
			gauge: TachifyGauge(data.option.gauge),
			random: TachifyRandom(data.option.style),
			range: TachifyRange(data.option.range),
		},
	};

	return { song, chart, dryScore };
};

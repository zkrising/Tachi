import {
	InternalFailure,
	KTDataNotFoundFailure,
} from "lib/score-import/framework/common/converter-failures";
import { GenericGetGradeAndPercent } from "lib/score-import/framework/common/score-utils";
import { FindBMSChartOnHash } from "utils/queries/charts";
import { FindSongOnID } from "utils/queries/songs";
import type { ConverterFunction } from "../../common/types";
import type { LR2HookContext, LR2HookScore } from "./types";
import type { DryScore } from "lib/score-import/framework/common/types";
import type { Lamps, ScoreDocument } from "tachi-common";

export const ConverterLR2Hook: ConverterFunction<LR2HookScore, LR2HookContext> = async (
	data,
	context,
	importType,
	logger
) => {
	const chart = await FindBMSChartOnHash(data.md5);

	if (!chart) {
		throw new KTDataNotFoundFailure(
			`Could not find chart with md5 ${data.md5}.`,
			importType,
			data,
			context
		);
	}

	const song = await FindSongOnID("bms", chart.songID);

	if (!song) {
		logger.severe(`Song ${chart.songID} (bms) has no parent song?`);
		throw new InternalFailure(`Song ${chart.songID} (bms) has no parent song?`);
	}

	const { percent, grade } = GenericGetGradeAndPercent("bms", data.scoreData.exScore, chart);

	const gauge = ConvertGauge(data.playerData.gauge);
	const lamp = ConvertLamp(data.scoreData.lamp);

	let bp: number | null = data.scoreData.bad + data.scoreData.poor;

	// lr2hook doesn't send "max" BP so to speak. If you fail really early
	// or quit out, you can have an early fail with like, 5 BP.
	if (data.scoreData.notesPlayed !== data.scoreData.notesTotal) {
		bp = null;
	}

	const dryScore: DryScore<"bms:7K" | "bms:14K"> = {
		game: "bms",
		service: "LR2Hook",
		comment: null,
		importType: "ir/lr2hook",
		timeAchieved: context.timeReceived,
		scoreData: {
			score: data.scoreData.exScore,
			percent,
			grade,
			lamp,
			judgements: {
				pgreat: data.scoreData.pgreat,
				great: data.scoreData.great,
				good: data.scoreData.good,
				bad: data.scoreData.bad,
				poor: data.scoreData.poor,
			},
			hitMeta: {
				bp,
				maxCombo: data.scoreData.maxCombo,
				gauge: data.scoreData.hpGraph[999] ?? 0,
				gaugeHistory: data.scoreData.hpGraph,
			},
		},
		scoreMeta: {
			gauge,
			random: chart.playtype === "7K" ? ConvertRandom(data.playerData.random) : null,
			client: "LR2",
		},
	};

	return { song, chart, dryScore };
};

function ConvertGauge(
	gauge: LR2HookScore["playerData"]["gauge"]
): ScoreDocument<"bms:7K" | "bms:14K">["scoreMeta"]["gauge"] {
	switch (gauge) {
		case "EASY":
			return "EASY";
		case "GROOVE":
			return "NORMAL";
		case "HARD":
		case "G-ATTACK":
		case "HAZARD":
		case "P-ATTACK":
			return "HARD";
	}
}

function ConvertRandom(
	random: LR2HookScore["playerData"]["random"]
): ScoreDocument<"bms:7K">["scoreMeta"]["random"] {
	switch (random) {
		case "NORAN":
			return "NONRAN";
		case "MIRROR":
			return "MIRROR";
		case "RAN":
			return "RANDOM";
		case "S-RAN":
			return "S-RANDOM";
	}
}

function ConvertLamp(lamp: LR2HookScore["scoreData"]["lamp"]): Lamps["bms:7K" | "bms:14K"] {
	switch (lamp) {
		case "EASY":
			return "EASY CLEAR";
		case "FAIL":
			return "FAILED";
		case "FULL COMBO":
			return "FULL COMBO";
		case "HARD":
			return "HARD CLEAR";
		case "NO PLAY":
			return "NO PLAY";
		case "NORMAL":
			return "CLEAR";
	}
}

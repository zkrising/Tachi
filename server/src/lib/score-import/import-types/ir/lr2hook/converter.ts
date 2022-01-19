import { Lamps, ScoreDocument } from "tachi-common";
import {
	InternalFailure,
	InvalidScoreFailure,
	KTDataNotFoundFailure,
} from "lib/score-import/framework/common/converter-failures";
import { GenericGetGradeAndPercent } from "lib/score-import/framework/common/score-utils";
import { DryScore } from "lib/score-import/framework/common/types";
import { FindBMSChartOnHash } from "utils/queries/charts";
import { FindSongOnID } from "utils/queries/songs";
import { ConverterFunction } from "../../common/types";
import { LR2HookContext, LR2HookScore } from "./types";

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
			lamp: ConvertLamp(data.scoreData.lamp),
			judgements: {
				pgreat: data.scoreData.pgreat,
				great: data.scoreData.great,
				good: data.scoreData.good,
				bad: data.scoreData.bad,
				poor: data.scoreData.poor,
			},
			hitMeta: {
				bp: data.scoreData.bad + data.scoreData.poor,
				maxCombo: data.scoreData.maxCombo,
				gauge: data.scoreData.hpGraph[999] ?? 0,
			},
		},
		scoreMeta: {
			gauge: ConvertGauge(data.playerData.gauge),
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

import { SV6CConvertDifficulty, SV6CConvertLamp } from "../kshook-sv6c/converter";
import {
	InternalFailure,
	KTDataNotFoundFailure,
} from "lib/score-import/framework/common/converter-failures";
import { GenericGetGradeAndPercent } from "lib/score-import/framework/common/score-utils";
import { FindSDVXChartOnInGameIDVersion } from "utils/queries/charts";
import { FindSongOnID } from "utils/queries/songs";
import type { ConverterFunction } from "../../common/types";
import type { KsHookSV6CStaticScore } from "./types";
import type { DryScore } from "lib/score-import/framework/common/types";
import type { EmptyObject } from "utils/types";

export const ConverterKsHookSV6CStatic: ConverterFunction<
	KsHookSV6CStaticScore,
	EmptyObject
> = async (data, context, importType, logger) => {
	const diff = SV6CConvertDifficulty(data.difficulty);

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
		service: "kshook SV6C Static",
		comment: null,
		importType: "ir/kshook-sv6c",
		timeAchieved: data.timestamp,
		scoreData: {
			score: data.score,
			percent,
			grade,
			lamp: SV6CConvertLamp(data.clear),
			judgements: {},
			hitMeta: {
				maxCombo: data.max_chain,
				exScore: data.ex_score,
			},
		},
		scoreMeta: {},
	};

	return { song, chart, dryScore };
};

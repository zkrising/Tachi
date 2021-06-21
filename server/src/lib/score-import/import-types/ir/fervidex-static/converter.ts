import { FindSongOnID } from "../../../../../utils/queries/songs";
import { GenericGetGradeAndPercent } from "../../../framework/common/score-utils";
import {
	InternalFailure,
	KTDataNotFoundFailure,
} from "../../../framework/common/converter-failures";
import { Lamps } from "tachi-common";
import { FindChartOnInGameIDVersion } from "../../../../../utils/queries/charts";
import { FervidexStaticContext, FervidexStaticScore } from "./types";
import { FERVIDEX_LAMP_LOOKUP, SplitFervidexChartRef } from "../fervidex/converter";
import { DryScore } from "../../../framework/common/types";
import { ConverterFunction } from "../../common/types";

export const ConverterIRFervidexStatic: ConverterFunction<
	FervidexStaticScore,
	FervidexStaticContext
> = async (data, context, importType, logger) => {
	const { difficulty, playtype } = SplitFervidexChartRef(data.chart);

	const chart = await FindChartOnInGameIDVersion(
		"iidx",
		data.song_id,
		playtype,
		difficulty,
		context.version
	);

	if (!chart) {
		throw new KTDataNotFoundFailure(
			`Could not find chart with songID ${data.song_id} (${playtype} ${difficulty} Version ${context.version})`,
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

	const { percent, grade } = GenericGetGradeAndPercent("iidx", data.ex_score, chart);

	const dryScore: DryScore<"iidx:SP" | "iidx:DP"> = {
		game: "iidx",
		service: "Fervidex Static",
		comment: null,
		importType: "ir/fervidex-static",
		timeAchieved: null,
		scoreData: {
			score: data.ex_score,
			percent,
			grade,
			lamp: FERVIDEX_LAMP_LOOKUP[data.clear_type] as Lamps["iidx:SP" | "iidx:DP"],
			judgements: {},
			hitMeta: {
				bp: data.miss_count === -1 ? null : data.miss_count,
			},
		},
		scoreMeta: {},
	};

	return { song, chart, dryScore };
};

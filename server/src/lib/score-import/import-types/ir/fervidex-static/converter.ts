import {
	InternalFailure,
	KTDataNotFoundFailure,
} from "../../../framework/common/converter-failures";
import { GenericGetGradeAndPercent } from "../../../framework/common/score-utils";
import { FERVIDEX_LAMP_LOOKUP, SplitFervidexChartRef } from "../fervidex/converter";
import { FindChartOnInGameIDVersion } from "utils/queries/charts";
import { FindSongOnID } from "utils/queries/songs";
import type { DryScore } from "../../../framework/common/types";
import type { ConverterFunction } from "../../common/types";
import type { FervidexStaticContext, FervidexStaticScore } from "./types";
import type { Lamps } from "tachi-common";

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

	const hitMeta: { bp?: number | null } = {};

	if (data.miss_count !== undefined) {
		hitMeta.bp = data.miss_count === -1 ? null : data.miss_count;
	}

	const dryScore: DryScore<"iidx:DP" | "iidx:SP"> = {
		game: "iidx",
		service: "Fervidex Static",
		comment: null,
		importType: "ir/fervidex-static",
		timeAchieved: null,
		scoreData: {
			score: data.ex_score,
			percent,
			grade,
			lamp: FERVIDEX_LAMP_LOOKUP[data.clear_type] as Lamps["iidx:DP" | "iidx:SP"],
			judgements: {},
			hitMeta,
		},
		scoreMeta: {},
	};

	return { song, chart, dryScore };
};

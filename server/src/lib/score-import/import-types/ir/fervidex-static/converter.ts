import {
	InternalFailure,
	SongOrChartNotFoundFailure,
} from "../../../framework/common/converter-failures";
import { FERVIDEX_LAMP_LOOKUP, SplitFervidexChartRef } from "../fervidex/converter";
import { FindChartOnInGameIDVersion } from "utils/queries/charts";
import { FindSongOnID } from "utils/queries/songs";
import type { DryScore } from "../../../framework/common/types";
import type { ConverterFunction } from "../../common/types";
import type { FervidexStaticContext, FervidexStaticScore } from "./types";

export const ConverterIRFervidexStatic: ConverterFunction<
	FervidexStaticScore,
	FervidexStaticContext
> = async (data, context, importType, logger) => {
	let { difficulty, playtype } = SplitFervidexChartRef(data.chart);

	//hack for scripted connection long support in older omnimixes
	if(data.entry_id === 21201 && difficulty === "ANOTHER") {
		data.entry_id = 12250;
		difficulty = "LEGGENDARIA";
	}

	const chart = await FindChartOnInGameIDVersion(
		"iidx",
		data.song_id,
		playtype,
		difficulty,
		context.version
	);

	if (!chart) {
		throw new SongOrChartNotFoundFailure(
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

	const optional: { bp?: number | null } = {};

	if (data.miss_count !== undefined) {
		optional.bp = data.miss_count === -1 ? null : data.miss_count;
	}

	const dryScore: DryScore<"iidx:DP" | "iidx:SP"> = {
		game: "iidx",
		service: "Fervidex Static",
		comment: null,
		importType: "ir/fervidex-static",
		timeAchieved: null,
		scoreData: {
			score: data.ex_score,
			lamp: FERVIDEX_LAMP_LOOKUP[data.clear_type],
			judgements: {},
			optional,
		},
		scoreMeta: {},
	};

	return { song, chart, dryScore };
};

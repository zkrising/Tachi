import {
	InternalFailure,
	SkipScoreFailure,
	SongOrChartNotFoundFailure,
} from "../../../framework/common/converter-failures";
import { ParseDateFromString } from "../../../framework/common/score-utils";
import { FindIIDXChartOnInGameID } from "utils/queries/charts";
import { FindSongOnID } from "utils/queries/songs";
import type { DryScore } from "../../../framework/common/types";
import type { ConverterFunction } from "../../common/types";
import type { MerScore } from "./types";
import type { GetEnumValue } from "tachi-common/types/metrics";
import type { EmptyObject } from "utils/types";

function ConvertMERLamp(lamp: MerScore["clear_type"]): GetEnumValue<"iidx:DP" | "iidx:SP", "lamp"> {
	if (lamp === "FULLCOMBO CLEAR") {
		return "FULL COMBO";
	}

	return lamp;
}

export const ConvertFileMerIIDX: ConverterFunction<MerScore, EmptyObject> = async (
	data,
	context,
	importType,
	logger
) => {
	const playtype = data.play_type === "SINGLE" ? "SP" : "DP";

	if (data.diff_type === "BEGINNER") {
		throw new SkipScoreFailure(`BEGINNER scores are not supported.`);
	}

	const chart = await FindIIDXChartOnInGameID(data.music_id, playtype, data.diff_type);

	if (!chart) {
		throw new SongOrChartNotFoundFailure(
			`Could not find chart with musicID ${data.music_id} (${playtype} ${data.diff_type}.)`,
			importType,
			data,
			context
		);
	}

	const song = await FindSongOnID("iidx", chart.songID);

	if (!song) {
		logger.severe(`Could not find song with songID ${chart.songID}, but chart exists for it?`);
		throw new InternalFailure(`Song-Chart Desync on songID ${chart.songID}`);
	}

	const lamp = ConvertMERLamp(data.clear_type);

	const timeAchieved = ParseDateFromString(ConvertDateToJST(data.update_time));

	const dryScore: DryScore<"iidx:DP" | "iidx:SP"> = {
		game: "iidx",
		comment: null,
		importType: "file/mer-iidx",
		service: "MER",
		scoreData: {
			score: data.score,
			lamp,
			judgements: {},
			optional: {
				bp: data.miss_count === -1 ? null : data.miss_count,
			},
		},
		scoreMeta: {},
		timeAchieved: timeAchieved !== null ? timeAchieved : null,
	};

	return {
		chart,
		song,
		dryScore,
	};
};

/**
 * MER passes us a rather useless date without any timezone information.
 * To ensure that this parses properly regardless of timezone, we need to
 * assert thathere.
 *
 * @param uselessDate - A date string like 2021-03-24 07:15:22.
 * As you can see, it has no timezone information, and is ambiguous.
 */
function ConvertDateToJST(uselessDate: string) {
	return `${uselessDate.replace(" ", "T")}+09:00`;
}

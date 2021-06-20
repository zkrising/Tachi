import { FindIIDXChartOnInGameID } from "../../../../../utils/queries/charts";
import { FindSongOnID } from "../../../../../utils/queries/songs";
import { EmptyObject } from "../../../../../utils/types";
import {
	InternalFailure,
	KTDataNotFoundFailure,
} from "../../../framework/common/converter-failures";
import {
	GenericGetGradeAndPercent,
	ParseDateFromString,
} from "../../../framework/common/score-utils";
import { MerScore } from "./types";
import { Lamps } from "tachi-common";
import { DryScore } from "../../../framework/common/types";
import { ConverterFunction } from "../../common/types";

function ConvertMERLamp(lamp: MerScore["clear_type"]): Lamps["iidx:DP" | "iidx:SP"] {
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

	const chart = await FindIIDXChartOnInGameID(data.music_id, playtype, data.diff_type);

	if (!chart) {
		throw new KTDataNotFoundFailure(
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

	const { percent, grade } = GenericGetGradeAndPercent("iidx", data.score, chart);

	const lamp = ConvertMERLamp(data.clear_type);

	const timeAchieved = ParseDateFromString(data.update_time);

	const dryScore: DryScore<"iidx:SP" | "iidx:DP"> = {
		game: "iidx",
		comment: null,
		importType: "file/mer-iidx",
		service: "MER",
		scoreData: {
			score: data.score,
			percent,
			grade,
			lamp,
			hitData: {},
			hitMeta: {
				bp: data.miss_count === -1 ? null : data.miss_count,
			},
		},
		scoreMeta: {},
		// japan is GMT+9
		timeAchieved: timeAchieved ? timeAchieved - NINE_HOURS : null,
	};

	return {
		chart,
		song,
		dryScore,
	};
};

const NINE_HOURS = 1000 * 60 * 60 * 9;

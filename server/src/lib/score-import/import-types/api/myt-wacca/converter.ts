import {
	InternalFailure,
	InvalidScoreFailure,
	SongOrChartNotFoundFailure,
} from "lib/score-import/framework/common/converter-failures";
import { ParseDateFromString } from "lib/score-import/framework/common/score-utils";
import { WaccaMusicDifficulty } from "proto/generated/wacca/common_pb";
import { FindChartOnInGameID } from "utils/queries/charts";
import { FindSongOnID } from "utils/queries/songs";
import type { ConverterFunction } from "../../common/types";
import type { MytWaccaScore } from "./types";
import type { DryScore } from "lib/score-import/framework/common/types";
import type { WaccaClearStatus, WaccaMusicDifficultyMap } from "proto/generated/wacca/common_pb";
import type { Difficulties } from "tachi-common";
import type { GetEnumValue } from "tachi-common/types/metrics";
import type { EmptyObject } from "utils/types";

const DIFFICULTIES: Record<
	WaccaMusicDifficultyMap[keyof WaccaMusicDifficultyMap],
	Difficulties["wacca:Single"] | undefined
> = {
	[WaccaMusicDifficulty.WACCA_MUSIC_DIFFICULTY_UNSPECIFIED]: undefined,
	[WaccaMusicDifficulty.WACCA_MUSIC_DIFFICULTY_NORMAL]: "NORMAL",
	[WaccaMusicDifficulty.WACCA_MUSIC_DIFFICULTY_HARD]: "HARD",
	[WaccaMusicDifficulty.WACCA_MUSIC_DIFFICULTY_EXPERT]: "EXPERT",
	[WaccaMusicDifficulty.WACCA_MUSIC_DIFFICULTY_INFERNO]: "INFERNO",
};

function convertClearStatus(
	status: WaccaClearStatus.AsObject | undefined
): GetEnumValue<"wacca:Single", "lamp"> {
	if (status === undefined) {
		throw new InvalidScoreFailure(`Can't process a score without clearStatus`);
	}

	if (status.isAllMarvelous) {
		return "ALL MARVELOUS";
	}

	if (status.isFullCombo) {
		return "FULL COMBO";
	}

	if (status.isMissless) {
		return "MISSLESS";
	}

	if (status.isClear) {
		return "CLEAR";
	}

	// Give up and failed are handled the same.
	return "FAILED";
}

const ConvertAPIMytWACCA: ConverterFunction<MytWaccaScore, EmptyObject> = async (
	data,
	_context,
	importType,
	logger
) => {
	const difficulty = DIFFICULTIES[data.musicDifficulty];

	if (difficulty === undefined) {
		throw new InvalidScoreFailure(
			`Can't process a score with unspecified difficulty (musicId ${data.musicId})`
		);
	}

	const chart = await FindChartOnInGameID("wacca", data.musicId, "Single", difficulty);

	if (chart === null) {
		throw new SongOrChartNotFoundFailure(
			`Can't find chart with id ${data.musicId} and difficulty ${difficulty}`,
			importType,
			data,
			{}
		);
	}

	const song = await FindSongOnID("wacca", chart.songID);

	if (song === null) {
		logger.severe(`Song/chart desync: ${chart.songID} for chart ${chart.chartID}`, { chart });
		throw new InternalFailure(`Song/chart desync: ${chart.songID} for chart ${chart.chartID}`);
	}

	const lamp = convertClearStatus(data.clearStatus);
	const timeAchieved = ParseDateFromString(data.userPlayDate);

	const dryScore: DryScore<"wacca:Single"> = {
		service: "MYT",
		game: "wacca",
		scoreMeta: {},

		timeAchieved,
		comment: null,
		importType,
		scoreData: {
			score: data.score,
			lamp,
			judgements: {
				marvelous: data.judge?.marvelous,
				great: data.judge?.great,
				good: data.judge?.good,
				miss: data.judge?.miss,
			},
			optional: {
				fast: data.fast,
				slow: data.late,
				maxCombo: data.combo,
			},
		},
	};

	return { chart, song, dryScore };
};

export default ConvertAPIMytWACCA;

import {
	InternalFailure,
	InvalidScoreFailure,
	SkipScoreFailure,
	SongOrChartNotFoundFailure,
} from "lib/score-import/framework/common/converter-failures";
import { ParseDateFromString } from "lib/score-import/framework/common/score-utils";
import {
	MaimaiComboStatus,
	MaimaiLevel,
} from "proto/generated/maimai/common_pb";
import { FindChartOnInGameID } from "utils/queries/charts";
import { FindSongOnID } from "utils/queries/songs";
import type { ConverterFunction } from "../../common/types";
import type { MytMaimaiDxScore } from "./types";
import type { DryScore } from "lib/score-import/framework/common/types";
import type { ScoreData } from "tachi-common";
import type { EmptyObject } from "utils/types";

const DIFFICULTIES = {
	[MaimaiLevel.MAIMAI_LEVEL_UNSPECIFIED]: undefined,
	[MaimaiLevel.MAIMAI_LEVEL_BASIC]: "Basic",
	[MaimaiLevel.MAIMAI_LEVEL_ADVANCED]: "Advanced",
	[MaimaiLevel.MAIMAI_LEVEL_EXPERT]: "Expert",
	[MaimaiLevel.MAIMAI_LEVEL_MASTER]: "Master",
	[MaimaiLevel.MAIMAI_LEVEL_REMASTER]: "Re:Master",
	[MaimaiLevel.MAIMAI_LEVEL_UTAGE]: "Utage",
};

function getLamp(
	comboStatus: number,
	isClear: boolean,
): ScoreData<"maimaidx:Single">["lamp"] | undefined {
	if (comboStatus === MaimaiComboStatus.MAIMAI_COMBO_STATUS_UNSPECIFIED) {
		return undefined;
	}

	if (isClear === false) {
		return "FAILED";
	}

	if (comboStatus === MaimaiComboStatus.MAIMAI_COMBO_STATUS_NONE) {
		return "CLEAR";
	}

	if (comboStatus === MaimaiComboStatus.MAIMAI_COMBO_STATUS_FULL_COMBO) {
		return "FULL COMBO";
	}

	if (comboStatus === MaimaiComboStatus.MAIMAI_COMBO_STATUS_FULL_COMBO_PLUS) {
		return "FULL COMBO+";
	}

	if (comboStatus === MaimaiComboStatus.MAIMAI_COMBO_STATUS_ALL_PERFECT) {
		return "ALL PERFECT";
	}

	if (comboStatus === MaimaiComboStatus.MAIMAI_COMBO_STATUS_ALL_PERFECT_PLUS) {
		return "ALL PERFECT+";
	}

	return undefined;
}

const ConvertAPIMytMaimaiDx: ConverterFunction<
	MytMaimaiDxScore,
	EmptyObject
> = async (data, _context, importType, logger) => {
	if (data.info === undefined || data.judge === undefined) {
		throw new InvalidScoreFailure("Failed to receive score data from MYT API");
	}

	const baseDifficulty = DIFFICULTIES[data.info.level];
	if (baseDifficulty === undefined) {
		throw new InvalidScoreFailure(
			`Can't process a score with unspecified difficulty (musicId ${data.info.musicId})`,
		);
	}
	if (baseDifficulty === "Utage") {
		throw new SkipScoreFailure("Utage charts are not supported");
	}
	// Songs with an ID higher than 10000 are considered DX charts
	const difficulty =
		data.info.musicId >= 10000 ? `DX ${baseDifficulty}` : baseDifficulty;

	const lamp = getLamp(data.info.comboStatus, data.info.isClear);

	if (lamp === undefined) {
		throw new InvalidScoreFailure(
			"Can't process a score with an invalid combo status and/or clear status",
		);
	}

	const chart = await FindChartOnInGameID(
		"maimaidx",
		data.info.musicId,
		"Single",
		difficulty,
	);

	if (chart === null) {
		throw new SongOrChartNotFoundFailure(
			`Can't find chart with id ${data.info.musicId} and difficulty ${difficulty}`,
			importType,
			data,
			{},
		);
	}

	const song = await FindSongOnID("maimaidx", chart.songID);

	if (song === null) {
		logger.severe(
			`Song/chart desync: ${chart.songID} for chart ${chart.chartID}`,
			{ chart },
		);
		throw new InternalFailure(
			`Song/chart desync: ${chart.songID} for chart ${chart.chartID}`,
		);
	}

	const dryScore: DryScore<"maimaidx:Single"> = {
		service: "MYT",
		game: "maimaidx",
		scoreMeta: {},
		timeAchieved: ParseDateFromString(data.info.userPlayDate),
		comment: null,
		importType,
		scoreData: {
			percent: data.info.achievement / 10000,
			lamp,
			judgements: {
				pcrit: data.judge.judgeCriticalPerfect,
				perfect: data.judge.judgePerfect,
				great: data.judge.judgeGreat,
				good: data.judge.judgeGood,
				miss: data.judge.judgeMiss,
			},
			optional: {
				fast: data.judge.fastCount,
				slow: data.judge.lateCount,
				maxCombo: data.judge.maxCombo,
			},
		},
	};

	return { chart, song, dryScore };
};

export default ConvertAPIMytMaimaiDx;

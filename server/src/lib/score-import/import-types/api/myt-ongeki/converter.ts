import {
	InternalFailure,
	InvalidScoreFailure,
	SongOrChartNotFoundFailure,
} from "lib/score-import/framework/common/converter-failures";
import { ParseDateFromString } from "lib/score-import/framework/common/score-utils";
import {
	OngekiClearStatus,
	OngekiComboStatus,
	OngekiLevel,
} from "proto/generated/ongeki/common_pb";
import { FindChartOnInGameID } from "utils/queries/charts";
import { FindSongOnID } from "utils/queries/songs";
import type { ConverterFunction } from "../../common/types";
import type { MytOngekiScore } from "./types";
import type { DryScore } from "lib/score-import/framework/common/types";
import type { ScoreData } from "tachi-common";
import type { EmptyObject } from "utils/types";

const DIFFICULTIES = {
	[OngekiLevel.ONGEKI_LEVEL_UNSPECIFIED]: undefined,
	[OngekiLevel.ONGEKI_LEVEL_BASIC]: "BASIC",
	[OngekiLevel.ONGEKI_LEVEL_ADVANCED]: "ADVANCED",
	[OngekiLevel.ONGEKI_LEVEL_EXPERT]: "EXPERT",
	[OngekiLevel.ONGEKI_LEVEL_MASTER]: "MASTER",
	[OngekiLevel.ONGEKI_LEVEL_LUNATIC]: "LUNATIC",
};

function getNoteLamp(
	comboStatus: number,
	clearStatus: number,
	techScore: number
): ScoreData<"ongeki:Single">["noteLamp"] | undefined {
	if (
		comboStatus === OngekiComboStatus.ONGEKI_COMBO_STATUS_UNSPECIFIED ||
		clearStatus === OngekiClearStatus.ONGEKI_CLEAR_STATUS_UNSPECIFIED
	) {
		return undefined;
	}

	if (techScore === 1010000) {
		return "ALL BREAK+";
	}

	if (comboStatus === OngekiComboStatus.ONGEKI_COMBO_STATUS_ALL_BREAK) {
		return "ALL BREAK";
	}

	if (comboStatus === OngekiComboStatus.ONGEKI_COMBO_STATUS_FULL_COMBO) {
		return "FULL COMBO";
	}

	if (
		clearStatus === OngekiClearStatus.ONGEKI_CLEAR_STATUS_OVER_DAMAGE ||
		clearStatus === OngekiClearStatus.ONGEKI_CLEAR_STATUS_CLEARED
	) {
		return "CLEAR";
	}

	if (clearStatus === OngekiClearStatus.ONGEKI_CLEAR_STATUS_FAILED) {
		return "LOSS";
	}

	return undefined;
}

const ConvertAPIMytOngeki: ConverterFunction<MytOngekiScore, EmptyObject> = async (
	data,
	_context,
	importType,
	logger
) => {
	if (data.info === undefined || data.judge === undefined) {
		throw new InvalidScoreFailure("Failed to receive score data from MYT API");
	}

	const difficulty = DIFFICULTIES[data.info.level];

	if (difficulty === undefined) {
		throw new InvalidScoreFailure(
			`Can't process a score with unspecified difficulty (musicId ${data.info.musicId})`
		);
	}

	const noteLamp = getNoteLamp(data.info.comboStatus, data.info.clearStatus, data.info.techScore);

	if (noteLamp === undefined) {
		throw new InvalidScoreFailure(
			"Can't process a score with an invalid combo status and/or clear status"
		);
	}

	const chart = await FindChartOnInGameID("ongeki", data.info.musicId, "Single", difficulty);

	if (chart === null) {
		throw new SongOrChartNotFoundFailure(
			`Can't find chart with id ${data.info.musicId} and difficulty ${difficulty}`,
			importType,
			data,
			{}
		);
	}

	const song = await FindSongOnID("ongeki", chart.songID);

	if (song === null) {
		logger.severe(`Song/chart desync: ${chart.songID} for chart ${chart.chartID}`, { chart });
		throw new InternalFailure(`Song/chart desync: ${chart.songID} for chart ${chart.chartID}`);
	}

	const dryScore: DryScore<"ongeki:Single"> = {
		service: "MYT",
		game: "ongeki",
		scoreMeta: {},
		timeAchieved: ParseDateFromString(data.info.userPlayDate),
		comment: null,
		importType,
		scoreData: {
			score: data.info.techScore,
			noteLamp,
			bellLamp: data.info.isFullBell ? "FULL BELL" : "NONE",
			platinumScore: data.info.platinumScore,
			judgements: {
				cbreak: data.judge.judgeCriticalBreak,
				break: data.judge.judgeBreak,
				hit: data.judge.judgeHit,
				miss: data.judge.judgeMiss,
			},
			optional: {
				damage: data.judge.damageCount,
				bellCount: data.judge.bellCount,
				totalBellCount: data.judge.totalBellCount,
			},
		},
	};

	return { chart, song, dryScore };
};

export default ConvertAPIMytOngeki;

import {
	InternalFailure,
	InvalidScoreFailure,
	SkipScoreFailure,
	SongOrChartNotFoundFailure,
} from "lib/score-import/framework/common/converter-failures";
import { ParseDateFromString } from "lib/score-import/framework/common/score-utils";
import {
	ChunithmLevel,
	ChunithmComboStatus,
	ChunithmClearStatus,
} from "proto/generated/chunithm/common_pb";
import { FindChartOnInGameID } from "utils/queries/charts";
import { FindSongOnID } from "utils/queries/songs";
import type { ConverterFunction } from "../../common/types";
import type { MytChunithmScore } from "./types";
import type { DryScore } from "lib/score-import/framework/common/types";
import type { EmptyObject } from "utils/types";

const DIFFICULTIES = {
	[ChunithmLevel.CHUNITHM_LEVEL_UNSPECIFIED]: undefined,
	[ChunithmLevel.CHUNITHM_LEVEL_BASIC]: "BASIC",
	[ChunithmLevel.CHUNITHM_LEVEL_ADVANCED]: "ADVANCED",
	[ChunithmLevel.CHUNITHM_LEVEL_EXPERT]: "EXPERT",
	[ChunithmLevel.CHUNITHM_LEVEL_MASTER]: "MASTER",
	[ChunithmLevel.CHUNITHM_LEVEL_ULTIMA]: "ULTIMA",
	[ChunithmLevel.CHUNITHM_LEVEL_WORLDS_END]: "WORLD'S END",
};

const CLEAR_LAMPS = {
	[ChunithmClearStatus.CHUNITHM_CLEAR_STATUS_UNSPECIFIED]: undefined,
	[ChunithmClearStatus.CHUNITHM_CLEAR_STATUS_FAILED]: "FAILED",
	[ChunithmClearStatus.CHUNITHM_CLEAR_STATUS_CLEAR]: "CLEAR",
	[ChunithmClearStatus.CHUNITHM_CLEAR_STATUS_HARD]: "HARD",
	[ChunithmClearStatus.CHUNITHM_CLEAR_STATUS_ABSOLUTE]: "BRAVE",
	[ChunithmClearStatus.CHUNITHM_CLEAR_STATUS_ABSOLUTE_PLUS]: "ABSOLUTE",
	[ChunithmClearStatus.CHUNITHM_CLEAR_STATUS_CATASTROPHY]: "CATASTROPHY",
} as const;

const NOTE_LAMPS = {
	[ChunithmComboStatus.CHUNITHM_COMBO_STATUS_UNSPECIFIED]: undefined,
	[ChunithmComboStatus.CHUNITHM_COMBO_STATUS_NONE]: "NONE",
	[ChunithmComboStatus.CHUNITHM_COMBO_STATUS_FULL_COMBO]: "FULL COMBO",
	[ChunithmComboStatus.CHUNITHM_COMBO_STATUS_ALL_JUSTICE]: "ALL JUSTICE",
	[ChunithmComboStatus.CHUNITHM_COMBO_STATUS_ALL_JUSTICE_CRITICAL]: "ALL JUSTICE CRITICAL",
} as const;

const ConvertAPIMytChunithm: ConverterFunction<MytChunithmScore, EmptyObject> = async (
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
	} else if (difficulty === "WORLD'S END") {
		throw new SkipScoreFailure("WORLD'S END charts are not supported");
	}

	const clearLamp = CLEAR_LAMPS[data.info.clearStatus];

	if (clearLamp === undefined) {
		throw new InvalidScoreFailure("Can't process a score with an invalid clear status");
	}

	const noteLamp = NOTE_LAMPS[data.info.comboStatus];

	if (noteLamp === undefined) {
		throw new InvalidScoreFailure("Can't process a score with an invalid combo status");
	}

	const chart = await FindChartOnInGameID("chunithm", data.info.musicId, "Single", difficulty);

	if (chart === null) {
		throw new SongOrChartNotFoundFailure(
			`Can't find chart with id ${data.info.musicId} and difficulty ${difficulty}`,
			importType,
			data,
			{}
		);
	}

	const song = await FindSongOnID("chunithm", chart.songID);

	if (song === null) {
		logger.severe(`Song/chart desync: ${chart.songID} for chart ${chart.chartID}`, { chart });
		throw new InternalFailure(`Song/chart desync: ${chart.songID} for chart ${chart.chartID}`);
	}

	const dryScore: DryScore<"chunithm:Single"> = {
		service: "MYT",
		game: "chunithm",
		scoreMeta: {},
		timeAchieved: ParseDateFromString(data.info.userPlayDate),
		comment: null,
		importType,
		scoreData: {
			score: data.info.score,
			clearLamp,
			noteLamp,
			judgements: {
				jcrit: data.judge.judgeCritical + data.judge.judgeHeaven,
				justice: data.judge.judgeJustice,
				attack: data.judge.judgeAttack,
				miss: data.judge.judgeMiss,
			},
			optional: {
				maxCombo: data.judge.maxCombo,
			},
		},
	};

	return { chart, song, dryScore };
};

export default ConvertAPIMytChunithm;

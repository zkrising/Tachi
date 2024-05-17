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
import type { ScoreData } from "tachi-common";
import type { EmptyObject } from "utils/types";

function getLamp(
	comboStatus: number,
	clearStatus: number
): ScoreData<"chunithm:Single">["lamp"] | undefined {
	if (
		comboStatus === ChunithmComboStatus.CHUNITHM_COMBO_STATUS_UNSPECIFIED ||
		clearStatus === ChunithmClearStatus.CHUNITHM_CLEAR_STATUS_UNSPECIFIED
	) {
		return undefined;
	}

	if (comboStatus === ChunithmComboStatus.CHUNITHM_COMBO_STATUS_ALL_JUSTICE_CRITICAL) {
		return "ALL JUSTICE CRITICAL";
	}

	if (comboStatus === ChunithmComboStatus.CHUNITHM_COMBO_STATUS_ALL_JUSTICE) {
		return "ALL JUSTICE";
	}

	if (comboStatus === ChunithmComboStatus.CHUNITHM_COMBO_STATUS_FULL_COMBO) {
		return "FULL COMBO";
	}

	if (
		clearStatus === ChunithmClearStatus.CHUNITHM_CLEAR_STATUS_CLEAR ||
		clearStatus === ChunithmClearStatus.CHUNITHM_CLEAR_STATUS_HARD ||
		clearStatus === ChunithmClearStatus.CHUNITHM_CLEAR_STATUS_ABSOLUTE ||
		clearStatus === ChunithmClearStatus.CHUNITHM_CLEAR_STATUS_ABSOLUTE_PLUS ||
		clearStatus === ChunithmClearStatus.CHUNITHM_CLEAR_STATUS_CATASTROPHY
	) {
		return "CLEAR";
	}

	[ChunithmLevel.CHUNITHM_LEVEL_ULTIMA]: "ULTIMA",
	[ChunithmLevel.CHUNITHM_LEVEL_WORLDS_END]: "WORLD'S END",
};

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

	const lamp = getLamp(data.info.comboStatus, data.info.clearStatus);

	if (lamp === undefined) {
		throw new InvalidScoreFailure(
			"Can't process a score with an invalid combo status and/or clear status"
		);
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
			lamp,
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

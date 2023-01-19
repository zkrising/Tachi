import {
	InvalidScoreFailure,
	SongOrChartNotFoundFailure,
} from "lib/score-import/framework/common/converter-failures";
import { FindChartWithPTDF } from "utils/queries/charts";
import { FindSongOnTitle } from "utils/queries/songs";
import type { ConverterFunction } from "../../common/types";
import type { MyPageRecordsParsedPB } from "./types";
import type { DryScore } from "lib/score-import/framework/common/types";
import type { Difficulties } from "tachi-common";
import type { GetEnumValue } from "tachi-common/types/metrics";
import type { EmptyObject } from "utils/types";

const DIFFICULTIES: Array<Difficulties["wacca:Single"]> = ["NORMAL", "HARD", "EXPERT", "INFERNO"];

const LAMPS: Record<number, GetEnumValue<"wacca:Single", "lamp">> = {
	0: "FAILED",
	1: "CLEAR",
	2: "MISSLESS",
	3: "FULL COMBO",
	4: "ALL MARVELOUS",
};

const ConvertMyPageScraperRecordsCSV: ConverterFunction<
	MyPageRecordsParsedPB,
	EmptyObject
> = async (data, context, importType, logger) => {
	// TODO: If we can verify that songId matches in-game (data) id, we should use that instead.
	const song = await FindSongOnTitle("wacca", data.songTitle);

	if (song === null) {
		throw new SongOrChartNotFoundFailure(
			`Could not find song for ${data.songTitle}.`,
			importType,
			data,
			context
		);
	}

	const difficulty = DIFFICULTIES[data.diffIndex];

	if (difficulty === undefined) {
		throw new InvalidScoreFailure(
			`Invalid difficulty index of ${data.diffIndex}. This corresponds to some unknown difficulty. Invalid input?`
		);
	}

	const humanisedChartTitle = `${song.title} [${difficulty}]`;

	const chart = await FindChartWithPTDF("wacca", song.id, "Single", difficulty);

	if (chart === null) {
		throw new SongOrChartNotFoundFailure(
			`Could not find chart for ${humanisedChartTitle}.`,
			importType,
			data,
			context
		);
	}

	if (chart.level !== data.level) {
		throw new InvalidScoreFailure(
			`${humanisedChartTitle} - Should be level ${chart.level}, but found level ${data.level}.`
		);
	}

	const lamp = LAMPS[data.lamp];

	if (lamp === undefined) {
		logger.info(`Invalid lamp of ${data.lamp} provided.`);
		throw new InvalidScoreFailure(`${humanisedChartTitle} - Invalid lamp of ${data.lamp}.`);
	}

	const dryScore: DryScore<"wacca:Single"> = {
		service: "mypage-scraper",
		game: "wacca",
		scoreMeta: {},

		// This is really a PB, not an individual score, so it does not have a timestamp.
		timeAchieved: null,
		comment: null,
		importType,
		scoreData: {
			score: data.score,
			lamp,
			judgements: {},
			optional: {},
		},
	};

	return { chart, song, dryScore };
};

export default ConvertMyPageScraperRecordsCSV;

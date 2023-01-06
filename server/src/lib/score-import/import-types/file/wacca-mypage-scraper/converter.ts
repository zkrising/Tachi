import {
	InternalFailure,
	InvalidScoreFailure,
	SongOrChartNotFoundFailure,
} from "lib/score-import/framework/common/converter-failures";
import { GenericGetGradeAndPercent } from "lib/score-import/framework/common/score-utils";
import { FindChartWithPTDF } from "utils/queries/charts";
import { FindSongOnTitle } from "utils/queries/songs";
import type { ConverterFunction } from "../../common/types";
import type { MyPageRecordsParsedPB } from "./types";
import type { DryScore } from "lib/score-import/framework/common/types";
import type { Difficulties, Lamps } from "tachi-common";
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
		throw new InternalFailure(`We somehow got an invalid difficulty index ${data.diffIndex}.`);
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

	if (data.score > 1_000_000) {
		throw new InvalidScoreFailure(
			`${humanisedChartTitle} - Invalid score of ${data.score} (was greater than 1,000,000).`
		);
	}

	const lamp = LAMPS[data.lamp];

	if (lamp === undefined) {
		logger.info(`Invalid lamp of ${data.lamp} provided.`);
		throw new InvalidScoreFailure(`${humanisedChartTitle} - Invalid lamp of ${data.lamp}.`);
	}

	if (data.score === 1_000_000 && lamp !== "ALL MARVELOUS") {
		throw new InvalidScoreFailure(
			`MASTER score of ${data.score}, but lamp ${lamp} is not ALL MARVELOUS.`
		);
	}

	if (lamp === "ALL MARVELOUS" && data.score !== 1_000_000) {
		throw new InvalidScoreFailure(
			`AM lamp ${lamp}, but score is ${data.score}, not 1,000,000.`
		);
	}

	const { percent, grade } = GenericGetGradeAndPercent("wacca", data.score, chart);

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
			percent,
			grade,
			judgements: {},
			optional: {},
		},
	};

	logger.verbose(
		`Returning dryscore with ${dryScore.scoreData.score} for ${humanisedChartTitle}`
	);

	return { chart, song, dryScore };
};

export default ConvertMyPageScraperRecordsCSV;

import {
	InvalidScoreFailure,
	KTDataNotFoundFailure,
} from "lib/score-import/framework/common/converter-failures";
import { GenericGetGradeAndPercent } from "lib/score-import/framework/common/score-utils";
import { AssertStrAsPositiveInt } from "lib/score-import/framework/common/string-asserts";
import { FindChartWithPTDF } from "utils/queries/charts";
import { FindSongOnTitle } from "utils/queries/songs";
import type { ConverterFunction } from "../../common/types";
import type { SDVXEamusementCSVData } from "./types";
import type { DryScore } from "lib/score-import/framework/common/types";
import type { Difficulties, Lamps } from "tachi-common";
import type { EmptyObject } from "utils/types";

const DIFFICULTY_MAP: Map<string, Difficulties["sdvx:Single"]> = new Map([
	["NOVICE", "NOV"],
	["ADVANCED", "ADV"],
	["EXHAUST", "EXH"],
	["MAXIMUM", "MXM"],
	["INFINITE", "INF"],
	["GRAVITY", "GRV"],
	["HEAVENLY", "HVN"],
	["VIVID", "VVD"],
	["EXCEED", "XCD"],
]);

const LAMP_MAP: Map<string, Lamps["sdvx:Single"]> = new Map([
	["PLAYED", "FAILED"],
	["COMPLETE", "CLEAR"],
	["EXCESSIVE COMPLETE", "EXCESSIVE CLEAR"],
	["ULTIMATE CHAIN", "ULTIMATE CHAIN"],
	["PERFECT", "PERFECT ULTIMATE CHAIN"],
]);

const ConvertEamSDVXCSV: ConverterFunction<SDVXEamusementCSVData, EmptyObject> = async (
	data,
	context,
	importType,
	logger
) => {
	const song = await FindSongOnTitle("sdvx", data.title);

	if (!song) {
		throw new KTDataNotFoundFailure(
			`Could not find song for ${data.title}.`,
			importType,
			data,
			context
		);
	}

	const difficulty = DIFFICULTY_MAP.get(data.difficulty);

	if (!difficulty) {
		logger.info(`Invalid difficulty of ${data.difficulty} provided.`);
		throw new InvalidScoreFailure(`${data.title} - Invalid difficulty of ${data.difficulty}.`);
	}

	const humanisedChartTitle = `${song.title} [${difficulty}]`;

	const chart = await FindChartWithPTDF("sdvx", song.id, "Single", difficulty);

	if (!chart) {
		throw new KTDataNotFoundFailure(
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

	const score = AssertStrAsPositiveInt(
		data.score,
		`${humanisedChartTitle} - Invalid score of ${data.score}.`
	);

	if (score > 10_000_000) {
		throw new InvalidScoreFailure(
			`${humanisedChartTitle} - Invalid score of ${data.score} (was greater than 10,000,000).`
		);
	}

	// n.b. "positive int" here means non-negative, 0 is allowed.
	const exScoreOrZero = AssertStrAsPositiveInt(
		data.exscore,
		`${humanisedChartTitle} - Invalid EX score of ${data.score}.`
	);

	// It's theoretically possible to get an EX score of 0 on a legit play,
	// but this is also the default value if the PB has no EX score (that is,
	// this song has never been played with S-crit enabled). In this case,
	// we should not set exScore.
	const exScore = exScoreOrZero === 0 ? null : exScoreOrZero;

	const lamp = LAMP_MAP.get(data.lamp);

	if (!lamp) {
		logger.info(`Invalid lamp of ${data.lamp} provided.`);
		throw new InvalidScoreFailure(`${humanisedChartTitle} - Invalid lamp of ${data.lamp}.`);
	}

	const { percent, grade } = GenericGetGradeAndPercent("sdvx", score, chart);

	const dryScore: DryScore<"sdvx:Single"> = {
		service: "e-amusement",
		game: "sdvx",
		scoreMeta: {},

		// No timestamp data :(
		timeAchieved: null,
		comment: null,
		importType,
		scoreData: {
			score,
			lamp,
			percent,
			grade,
			judgements: {},
			hitMeta: {
				exScore,
			},
		},
	};

	logger.verbose(
		`Returning dryscore with ${dryScore.scoreData.score} for ${humanisedChartTitle}`
	);

	return { chart, song, dryScore };
};

export default ConvertEamSDVXCSV;

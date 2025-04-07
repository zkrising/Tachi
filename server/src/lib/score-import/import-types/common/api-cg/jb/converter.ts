import { FormatCGService } from "../util";
import {
	InternalFailure,
	InvalidScoreFailure,
	SongOrChartNotFoundFailure,
} from "lib/score-import/framework/common/converter-failures";
import { ParseDateFromString } from "lib/score-import/framework/common/score-utils";
import { FindChartOnInGameID } from "utils/queries/charts";
import { FindSongOnID } from "utils/queries/songs";
import type { ConverterFunction } from "../../types";
import type { CGContext, CGJubeatScore } from "../types";
import type { DryScore } from "lib/score-import/framework/common/types";
import type { Difficulties, integer, Judgements, Versions } from "tachi-common";

export const ConverterAPICGJubeat: ConverterFunction<CGJubeatScore, CGContext> = async (
	data,
	context,
	importType,
	logger
) => {
	const difficulty = ConvertDifficulty(data.difficulty, data.hardMode);
	const version = ConvertVersion(data.version);
	const musicRate = ConvertMusicRate(data.musicRate);
	const judgements = {
		perfect: data.perfectCount,
		great: data.greatCount,
		good: data.goodCount,
		poor: data.poorCount,
		miss: data.missCount,
	};
	const lamp = GuessLamp(judgements, data.score);

	const chart = await FindChartOnInGameID("jubeat", data.internalId, "Single", difficulty);

	if (!chart) {
		throw new SongOrChartNotFoundFailure(
			`Could not find chart with internalId ${data.internalId} (${difficulty} - Version ${version})`,
			importType,
			data,
			context
		);
	}

	const song = await FindSongOnID("jubeat", chart.songID);

	if (!song) {
		logger.severe(`Song-Chart desync with song ID ${chart.songID} (jubeat).`);
		throw new InternalFailure(`Song-Chart desync with song ID ${chart.songID} (jubeat).`);
	}

	const timeAchieved = ParseDateFromString(data.dateTime);

	const dryScore: DryScore<"jubeat:Single"> = {
		comment: null,
		game: "jubeat",
		importType,
		timeAchieved,
		service: FormatCGService(context.service),
		scoreData: {
			score: data.score,
			musicRate,
			lamp,
			judgements,
			optional: {},
		},
		scoreMeta: {},
	};

	return { song, chart, dryScore };
};

function ConvertDifficulty(diff: number, hardMode: boolean): Difficulties["jubeat:Single"] {
	if (!hardMode) {
		switch (diff) {
			case 0:
				return "BSC";
			case 1:
				return "ADV";
			case 2:
				return "EXT";
		}
	} else {
		switch (diff) {
			case 0:
				return "HARD BSC";
			case 1:
				return "HARD ADV";
			case 2:
				return "HARD EXT";
		}
	}

	throw new InvalidScoreFailure(`Invalid difficulty of ${diff} - Could not convert.`);
}

function ConvertVersion(ver: number): Versions["jubeat:Single"] {
	switch (ver) {
		case 1:
			return "jubeat";
		case 2:
			return "ripples";
		case 3:
			return "knit";
		case 4:
			return "copious";
		case 5:
			return "saucer";
		case 6:
			return "prop";
		case 7:
			return "qubell";
		case 8:
			return "clan";
		case 9:
		case 10: // special case for omni
			return "festo";
		case 11:
			return "ave";
	}

	throw new InvalidScoreFailure(`Unknown Game Version ${ver}.`);
}

function ConvertMusicRate(rate: number): number {
	return rate / 10;
}

function GuessLamp(judgments: Record<Judgements["jubeat:Single"], integer | null>, score: number) {
	if (
		judgments.good === 0 &&
		judgments.great === 0 &&
		judgments.miss === 0 &&
		judgments.poor === 0
	) {
		if (score !== 1_000_000) {
			throw new InvalidScoreFailure(`Score is an EXC, yet score !== 1_000_000.`);
		}

		return "EXCELLENT";
	} else if (judgments.miss === 0 && judgments.poor === 0) {
		return "FULL COMBO";
	} else if (score >= 700_000) {
		return "CLEAR";
	}

	return "FAILED";
}

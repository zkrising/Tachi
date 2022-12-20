import { InternalFailure, InvalidScoreFailure } from "./converter-failures";
import CreateLogCtx from "lib/logger/logger";
import { ESDCore, GetGamePTConfig } from "tachi-common";
import { FloorToNDP, IsNullish, NotNullish } from "utils/misc";
import type {
	ChartDocument,
	Game,
	GameToIDStrings,
	Grades,
	IDStrings,
	Playtype,
	Lamps,
	integer,
} from "tachi-common";

const logger = CreateLogCtx(__filename);

/**
 * Util for getting a games' grade for a given percent.
 */
export function GetGradeFromPercent<I extends IDStrings = IDStrings>(
	game: Game,
	playtype: Playtype,
	percent: number
): Grades[I] {
	const gptConfig = GetGamePTConfig(game, playtype);
	const boundaries = gptConfig.gradeBoundaries;
	const grades = gptConfig.grades;

	// (hey, this for loop is backwards!)
	for (let i = boundaries.length - 1; i >= 0; i--) {
		if (percent + Number.EPSILON >= NotNullish(boundaries[i])) {
			if (IsNullish(grades[i])) {
				logger.error(
					`Attempted to get the ${i}th grade for ${game} (${playtype}) for a percent of ${percent}%. The grade fetched was null or undefined. Refusing to process this score.`
				);
				throw new InternalFailure(
					`Failed to process a score with a percent of ${percent}. This has been reported.`
				);
			}

			return grades[i] as Grades[I];
		}
	}

	logger.error(`Could not resolve grade for percent ${percent} on game ${game}`);
	throw new InternalFailure(`Could not resolve grade for percent ${percent} on game ${game}.`);
}

/**
 * A generic function for calculating a percent from a given score on
 * a given game.
 */
export function GenericCalculatePercent(game: Game, score: number, chart?: ChartDocument): number {
	switch (game) {
		case "museca":
		case "chunithm":
		case "wacca":
			return (score / 1_000_000) * 100;
		case "sdvx":
		case "usc":
			return (score / 10_000_000) * 100;
		case "popn":
			return (score / 100_000) * 100;
		case "bms":
		case "pms":
		case "iidx": {
			if (!chart) {
				logger.severe("No Chart passed to GenericCalcPercent but game was iidx/bms/pms.");
				throw new InternalFailure(
					"No Chart passed to GenericCalcPercent but game was iidx/bms/pms."
				);
			}

			// Yeah, we declare it like this so the below return is actually clear.
			// eslint-disable-next-line no-case-declarations
			const MAX =
				(
					chart as ChartDocument<
						| "bms:7K"
						| "bms:14K"
						| "iidx:DP"
						| "iidx:SP"
						| "pms:Controller"
						| "pms:Keyboard"
					>
				).data.notecount * 2;

			return (100 * score) / MAX;
		}

		case "jubeat":
			throw new Error(`Cannot calculate percent for jubeat. Music Rate must be provided.`);

		// gitadora's score is just a percent
		// this is a hack: we need a refactor for this.
		case "gitadora":
		case "itg":
			return score;

		default: {
			logger.severe(`Invalid game passed of ${game} to GenericCalcPercent.`);
			throw new InternalFailure(`Invalid game passed of ${game} to GenericCalcPercent.`);
		}
	}
}

/**
 * Helper utility for validating percents on a game. This throws an InvalidScoreFailure if the percent is
 * invalid, and returns void on success.
 */
export function ValidatePercent(
	game: Game,
	playtype: Playtype,
	percent: number,
	chart: ChartDocument
) {
	const gptConfig = GetGamePTConfig(game, playtype);

	if (percent > gptConfig.percentMax) {
		throw new InvalidScoreFailure(
			`Invalid percent of ${percent} - expected a value less than ${gptConfig.percentMax}% (${chart.songID} ${chart.playtype} ${chart.difficulty}).`
		);
	}

	if (percent < 0) {
		throw new InvalidScoreFailure(
			`Invalid percent of ${percent} - Expected a positive number? (${chart.songID} ${chart.playtype} ${chart.difficulty})`
		);
	}
}

/**
 * Generically gets the grade and percent for a given score on a given game. This only works for games where
 * grades are just percent boundaries. This will throw an InvalidScoreFailure if the percent is invalid,
 * or if the grade is invalid.
 */
export function GenericGetGradeAndPercent<G extends Game>(
	game: G,
	score: number,
	chart: ChartDocument
): { percent: number; grade: Grades[GameToIDStrings[G]] } {
	const percent = GenericCalculatePercent(game, score, chart);

	ValidatePercent(game, chart.playtype, percent, chart);

	const grade: Grades[GameToIDStrings[G]] = GetGradeFromPercent(game, chart.playtype, percent);

	return { percent, grade };
}

export function JubeatGetGrade(score: number): Grades["jubeat:Single"] {
	if (score === 1_000_000) {
		return "EXC";
	} else if (score >= 980_000) {
		return "SSS";
	} else if (score >= 950_000) {
		return "SS";
	} else if (score >= 900_000) {
		return "S";
	} else if (score >= 850_000) {
		return "A";
	} else if (score >= 800_000) {
		return "B";
	} else if (score >= 700_000) {
		return "C";
	} else if (score >= 500_000) {
		return "D";
	}

	return "E";
}

/**
 * Calculates the ESD for a given game + percent combo. This function returns
 * null if the game does not support support ESD.
 */
export function CalculateESDForGame(
	game: Game,
	playtype: Playtype,
	percent: number
): number | null {
	const gptConfig = GetGamePTConfig(game, playtype);

	if (!gptConfig.supportsESD) {
		return null;
	}

	return ESDCore.CalculateESD(gptConfig.judgementWindows, percent);
}

/**
 * Parses and validates a date from a string.
 * @returns Milliseconds from the unix epoch, or null if the initial argument was null or undefined.
 */
export function ParseDateFromString(str: string | null | undefined): number | null {
	if (!str) {
		return null;
	}

	const date = Date.parse(str);

	if (Number.isNaN(date)) {
		throw new InvalidScoreFailure(`Invalid/Unparsable score timestamp of ${str}.`);
	}

	return date;
}

/**
 * Turn a museca score into its lamp. Note that we disagree with the game on what
 * constitutes a clear -- instead, 800k is marked as the minimum point for a clear.
 *
 * Museca actually handles clears differently with a bunch of grafica nonsense,
 * but nobody actually cares about it, so...
 */
export function MusecaGetLamp(score: integer, missCount: integer): Lamps["museca:Single"] {
	if (score === 1_000_000) {
		return "PERFECT CONNECT ALL";
	} else if (missCount === 0) {
		return "CONNECT ALL";
	} else if (score >= 800_000) {
		return "CLEAR";
	}

	return "FAILED";
}

export function JubeatGetLamp(score: integer, missCount: integer): Lamps["jubeat:Single"] {
	if (score === 1_000_000) {
		return "EXCELLENT";
	} else if (missCount === 0) {
		return "FULL COMBO";
	} else if (score >= 700_000) {
		return "CLEAR";
	}

	return "FAILED";
}

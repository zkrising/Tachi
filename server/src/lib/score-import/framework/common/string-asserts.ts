import { InvalidScoreFailure } from "./converter-failures";
import { Difficulties, Game, IDStrings, Playtypes, GetGamePTConfig } from "tachi-common";
export function AssertStrAsDifficulty(
	strVal: string,
	game: Game,
	playtype: Playtypes[Game]
): Difficulties[IDStrings] {
	const validDifficulties = GetGamePTConfig(game, playtype).difficulties;

	if (!validDifficulties.includes(strVal as Difficulties[IDStrings])) {
		throw new InvalidScoreFailure(
			`Invalid Difficulty for ${game} ${playtype} - Expected any of ${validDifficulties.join(
				", "
			)}`
		);
	}

	return strVal as Difficulties[IDStrings];
}

const isIntegerRegex = /^-?\d+$/u;

export function AssertStrAsPositiveInt(strVal: string, errorMessage: string) {
	const isInt = isIntegerRegex.test(strVal);

	if (!isInt) {
		throw new InvalidScoreFailure(`${errorMessage} (Not an integer.)`);
	}

	const val = Number(strVal);

	if (!Number.isSafeInteger(val)) {
		throw new InvalidScoreFailure(`${errorMessage} (Not an integer.)`);
	} else if (val < 0) {
		throw new InvalidScoreFailure(`${errorMessage} (Was negative.)`);
	}

	return val;
}

export function AssertStrAsPositiveNonZeroInt(strVal: string, errorMessage: string) {
	const isInt = isIntegerRegex.test(strVal);

	if (!isInt) {
		throw new InvalidScoreFailure(`${errorMessage} (Not an integer.)`);
	}

	const val = Number(strVal);

	if (!Number.isSafeInteger(val)) {
		throw new InvalidScoreFailure(`${errorMessage} (Not an integer.)`);
	} else if (val <= 0) {
		throw new InvalidScoreFailure(`${errorMessage} (Was negative or zero.)`);
	}

	return val;
}

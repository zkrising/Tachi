import { InvalidScoreFailure } from "./converter-failures";
import { GetGamePTConfig } from "tachi-common";
import type { Difficulties, Game, IDStrings, Playtype } from "tachi-common";

export function AssertStrAsDifficulty(
	strVal: string,
	game: Game,
	playtype: Playtype
): Difficulties[IDStrings] {
	const validDifficulties = GetGamePTConfig(game, playtype).difficulties;

	if (!validDifficulties.includes(strVal)) {
		throw new InvalidScoreFailure(
			`Invalid Difficulty for ${game} ${playtype} - Expected any of ${validDifficulties.join(
				", "
			)} (Got ${strVal})`
		);
	}

	return strVal;
}

const isIntegerRegex = /^-?\d+$/u;

export function AssertStrAsPositiveInt(strVal: string, errorMessage: string) {
	const isInt = isIntegerRegex.test(strVal);

	if (!isInt) {
		throw new InvalidScoreFailure(`${errorMessage} (Not an integer -- ${strVal}.)`);
	}

	const val = Number(strVal);

	if (!Number.isSafeInteger(val)) {
		throw new InvalidScoreFailure(`${errorMessage} (Not an integer -- ${strVal}.)`);
	} else if (val < 0) {
		throw new InvalidScoreFailure(`${errorMessage} (Was negative -- ${strVal}.)`);
	}

	return val;
}

export function AssertStrAsPositiveNonZeroInt(strVal: string, errorMessage: string) {
	const isInt = isIntegerRegex.test(strVal);

	if (!isInt) {
		throw new InvalidScoreFailure(`${errorMessage} (Not an integer -- ${strVal}.)`);
	}

	const val = Number(strVal);

	if (!Number.isSafeInteger(val)) {
		throw new InvalidScoreFailure(`${errorMessage} (Not an integer -- ${val}.)`);
	} else if (val <= 0) {
		throw new InvalidScoreFailure(`${errorMessage} (Was negative or zero -- ${val}.)`);
	}

	return val;
}

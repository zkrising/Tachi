import { IsString } from "./misc";
import { GetGamePTConfig } from "tachi-common";
import type {
	AnyProfileRatingAlg,
	AnyScoreRatingAlg,
	AnySessionRatingAlg,
	Game,
	Playtype,
} from "tachi-common";

const isIntegerRegex = /^-?\d+$/u;

export function ParseStrPositiveInt(val: unknown) {
	if (!IsString(val)) {
		return null;
	}

	const isInt = isIntegerRegex.test(val);

	if (!isInt) {
		return null;
	}

	const v = Number(val);

	if (!Number.isSafeInteger(v) || v < 0) {
		return null;
	}

	return v;
}

export function ParseStrPositiveNonZeroInt(val: unknown) {
	if (!IsString(val)) {
		return null;
	}

	const isInt = isIntegerRegex.test(val);

	if (!isInt) {
		return null;
	}

	const v = Number(val);

	if (!Number.isSafeInteger(v) || v <= 0) {
		return null;
	}

	return v;
}

export function CheckStrProfileAlg(game: Game, playtype: Playtype, strVal: string) {
	const gptConfig = GetGamePTConfig(game, playtype);

	// @hack
	if (!Object.keys(gptConfig.profileRatingAlgs).includes(strVal as AnyProfileRatingAlg)) {
		return null;
	}

	return strVal as AnyProfileRatingAlg;
}

export function CheckStrScoreAlg(game: Game, playtype: Playtype, strVal: string) {
	const gptConfig = GetGamePTConfig(game, playtype);

	// @hack
	if (!Object.keys(gptConfig.scoreRatingAlgs).includes(strVal as AnyScoreRatingAlg)) {
		return null;
	}

	return strVal as AnyScoreRatingAlg;
}

export function CheckStrSessionAlg(game: Game, playtype: Playtype, strVal: string) {
	const gptConfig = GetGamePTConfig(game, playtype);

	// @hack
	if (!Object.keys(gptConfig.sessionRatingAlgs).includes(strVal as AnySessionRatingAlg)) {
		return null;
	}

	return strVal as AnySessionRatingAlg;
}

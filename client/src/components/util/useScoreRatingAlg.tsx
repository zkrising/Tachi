import {
	Game,
	GetGamePTConfig,
	GPTString,
	Playtype,
	ProfileRatingAlgorithms,
	ScoreRatingAlgorithms,
	SessionRatingAlgorithms,
} from "tachi-common";
import useLUGPTSettings from "./useLUGPTSettings";

export default function useScoreRatingAlg<GPT extends GPTString = GPTString>(
	game: Game,
	playtype: Playtype
): ScoreRatingAlgorithms[GPT] {
	const { settings } = useLUGPTSettings();

	if (!settings?.preferences.preferredScoreAlg) {
		const gptConfig = GetGamePTConfig(game, playtype);

		return gptConfig.defaultScoreRatingAlg as ScoreRatingAlgorithms[GPT];
	}

	return settings.preferences.preferredScoreAlg as ScoreRatingAlgorithms[GPT];
}

export function useSessionRatingAlg<GPT extends GPTString = GPTString>(
	game: Game,
	playtype: Playtype
): SessionRatingAlgorithms[GPT] {
	const { settings } = useLUGPTSettings();

	if (!settings?.preferences.preferredSessionAlg) {
		const gptConfig = GetGamePTConfig(game, playtype);

		return gptConfig.defaultSessionRatingAlg as SessionRatingAlgorithms[GPT];
	}

	return settings.preferences.preferredSessionAlg as SessionRatingAlgorithms[GPT];
}

export function useProfileRatingAlg<GPT extends GPTString = GPTString>(
	game: Game,
	playtype: Playtype
): ProfileRatingAlgorithms[GPT] {
	const { settings } = useLUGPTSettings();

	if (!settings?.preferences.preferredProfileAlg) {
		const gptConfig = GetGamePTConfig(game, playtype);

		return gptConfig.defaultProfileRatingAlg as ProfileRatingAlgorithms[GPT];
	}

	return settings.preferences.preferredProfileAlg as ProfileRatingAlgorithms[GPT];
}

import { UGPTSettingsContext } from "context/UGPTSettingsContext";
import { useContext } from "react";
import {
	Game,
	GetGamePTConfig,
	IDStrings,
	ScoreCalculatedDataLookup,
	SessionCalculatedDataLookup,
	UGSRatingsLookup,
} from "tachi-common";
import { Playtype } from "types/tachi";

export default function useScoreRatingAlg<I extends IDStrings = IDStrings>(
	game: Game,
	playtype: Playtype
): ScoreCalculatedDataLookup[I] {
	const { settings } = useContext(UGPTSettingsContext);

	if (!settings?.preferences.preferredScoreAlg) {
		const gptConfig = GetGamePTConfig(game, playtype);

		return gptConfig.defaultScoreRatingAlg as ScoreCalculatedDataLookup[I];
	}

	return settings.preferences.preferredScoreAlg as ScoreCalculatedDataLookup[I];
}

export function useSessionRatingAlg<I extends IDStrings = IDStrings>(
	game: Game,
	playtype: Playtype
): SessionCalculatedDataLookup[I] {
	const { settings } = useContext(UGPTSettingsContext);

	if (!settings?.preferences.preferredSessionAlg) {
		const gptConfig = GetGamePTConfig(game, playtype);

		return gptConfig.defaultSessionRatingAlg as SessionCalculatedDataLookup[I];
	}

	return settings.preferences.preferredSessionAlg as SessionCalculatedDataLookup[I];
}

export function useProfileRatingAlg<I extends IDStrings = IDStrings>(
	game: Game,
	playtype: Playtype
): UGSRatingsLookup[I] {
	const { settings } = useContext(UGPTSettingsContext);

	if (!settings?.preferences.preferredProfileAlg) {
		const gptConfig = GetGamePTConfig(game, playtype);

		return gptConfig.defaultProfileRatingAlg as UGSRatingsLookup[I];
	}

	return settings.preferences.preferredProfileAlg as UGSRatingsLookup[I];
}

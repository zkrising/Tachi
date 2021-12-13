import { UGPTSettingsContext } from "context/UGPTSettingsContext";
import { useContext } from "react";
import { Game, GetGamePTConfig } from "tachi-common";
import { Playtype } from "types/tachi";

export function useBucket(game: Game, playtype: Playtype) {
	const { settings } = useContext(UGPTSettingsContext);

	if (!settings?.preferences.scoreBucket) {
		const gptConfig = GetGamePTConfig(game, playtype);

		return gptConfig.scoreBucket;
	}

	return settings.preferences.scoreBucket;
}

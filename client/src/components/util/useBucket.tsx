import { Game, GetGamePTConfig } from "tachi-common";
import { Playtype } from "tachi-common";
import useLUGPTSettings from "./useLUGPTSettings";

export function useBucket(game: Game, playtype: Playtype) {
	const { settings } = useLUGPTSettings();

	if (!settings?.preferences.scoreBucket) {
		const gptConfig = GetGamePTConfig(game, playtype);

		return gptConfig.scoreBucket;
	}

	return settings.preferences.scoreBucket;
}

import { Game, GetGamePTConfig, Playtype } from "tachi-common";
import useLUGPTSettings from "./useLUGPTSettings";

export function useBucket(game: Game, playtype: Playtype) {
	const { settings } = useLUGPTSettings();

	if (!settings?.preferences.preferredDefaultEnum) {
		const gptConfig = GetGamePTConfig(game, playtype);

		return gptConfig.preferredDefaultEnum;
	}

	return settings.preferences.preferredDefaultEnum;
}

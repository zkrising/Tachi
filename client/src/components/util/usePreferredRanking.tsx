import { UGPTSettingsDocument } from "tachi-common";
import useLUGPTSettings from "./useLUGPTSettings";

export default function usePreferredRanking():
	| UGPTSettingsDocument["preferences"]["preferredRanking"]
	| null {
	const { settings } = useLUGPTSettings();

	return settings?.preferences.preferredRanking ?? null;
}

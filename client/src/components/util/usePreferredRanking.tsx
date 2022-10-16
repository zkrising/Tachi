import { UGPTSettings } from "tachi-common";
import useLUGPTSettings from "./useLUGPTSettings";

export default function usePreferredRanking():
	| UGPTSettings["preferences"]["preferredRanking"]
	| null {
	const { settings } = useLUGPTSettings();

	return settings?.preferences.preferredRanking ?? null;
}

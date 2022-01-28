import { UGPTSettingsContext } from "context/UGPTSettingsContext";
import { useContext } from "react";
import { IDStrings, UGPTSettings } from "tachi-common";
import { SetState } from "types/react";

export default function useUGPTSettings<I extends IDStrings>() {
	return useContext<{
		settings: UGPTSettings<I> | null;
		setSettings: SetState<UGPTSettings<I> | null>;
	}>(UGPTSettingsContext as any);
}

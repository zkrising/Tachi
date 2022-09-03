import { UGPTContext } from "context/UGPTContext";
import { useContext } from "react";
import { IDStrings, UGPTSettings } from "tachi-common";

export default function useLUGPTSettings<I extends IDStrings>() {
	const { loggedInData, setLoggedInData } = useContext(UGPTContext);

	const settings = (loggedInData?.settings ?? null) as UGPTSettings<I> | null;

	const setSettings = (newSettings: UGPTSettings<I>) => {
		if (!loggedInData) {
			throw new Error(`Tried to set settings while nobody was logged in?`);
		}

		setLoggedInData({
			...loggedInData,
			settings: newSettings,
		});
	};

	return { settings, setSettings };
}

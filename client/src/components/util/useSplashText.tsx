import { UserSettingsContext } from "context/UserSettingsContext";
import { useContext } from "react";
import { RFA } from "util/misc";
import { contentiousSplashes, loggedInSplashes, neutralSplashes } from "util/splashes";

export default function useSplashText() {
	const { settings } = useContext(UserSettingsContext);

	let set = [];

	if (!settings) {
		set = neutralSplashes;
	} else if (settings.preferences.contentiousContent) {
		set = neutralSplashes.concat(loggedInSplashes).concat(contentiousSplashes);
	} else {
		set = neutralSplashes.concat(loggedInSplashes);
	}

	return RFA(set);
}

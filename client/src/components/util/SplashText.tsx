import React, { useMemo, useContext } from "react";
import { UserContext } from "context/UserContext";
import { RFA } from "util/misc";
import { loggedInSplashes, neutralSplashes } from "util/splashes";

export default function SplashText() {
	const { user } = useContext(UserContext);
	// todo settings
	const splashSet = useMemo(() => {
		const ss = neutralSplashes;
		if (user) {
			ss.push(...loggedInSplashes);
		}
		return ss;
	}, [user]);

	return <>{RFA(splashSet)}</>;
}

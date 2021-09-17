import React from "react";
import useSplashText from "./useSplashText";

export default function SplashText() {
	const splash = useSplashText();

	return <>{splash}</>;
}

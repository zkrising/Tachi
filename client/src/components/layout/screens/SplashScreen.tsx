import React from "react";
import { CircularProgress } from "@material-ui/core";
import { toAbsoluteUrl } from "_metronic/_helpers";
import { TachiConfig } from "lib/config";
import SplashImage from "../misc/SplashImage";

export function SplashScreen({ broke }: { broke: string }) {
	return (
		<div id="splash-screen" className="splash-screen">
			<SplashImage />
			{!broke && <CircularProgress className="splash-screen-spinner" />}
			{broke && <p className="mt-4">{broke}</p>}
		</div>
	);
}

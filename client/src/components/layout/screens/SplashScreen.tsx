import React from "react";
import { CircularProgress } from "@material-ui/core";
import { toAbsoluteUrl } from "_metronic/_helpers";
import { TachiConfig } from "lib/config";

export function SplashScreen({ broke }: { broke: string }) {
	return (
		<div id="splash-screen" className="splash-screen">
			<img
				src={toAbsoluteUrl("/media/logos/logo-wordmark.png")}
				alt={TachiConfig.name}
				max-width="50%"
				width="256px"
			/>
			{!broke && <CircularProgress className="splash-screen-spinner" />}
			{broke && <p className="mt-4">{broke}</p>}
		</div>
	);
}

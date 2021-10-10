import { TachiConfig } from "lib/config";
import React from "react";
import { toAbsoluteUrl } from "_metronic/_helpers";

export default function SplashImage() {
	return (
		<img
			src={toAbsoluteUrl("/media/logos/logo-wordmark.png")}
			alt={TachiConfig.name}
			max-width="50%"
			width="256px"
		/>
	);
}

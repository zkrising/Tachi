import { ToCDNURL } from "util/api";
import { TachiConfig } from "lib/config";
import React from "react";

export default function SplashImage() {
	return (
		<img
			src={ToCDNURL("/logos/logo-wordmark.png")}
			alt={TachiConfig.name}
			max-width="50%"
			width="256px"
		/>
	);
}

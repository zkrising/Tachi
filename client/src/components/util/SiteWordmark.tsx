import { ToCDNURL } from "util/api";
import { TachiConfig } from "lib/config";
import React from "react";

export default function SiteWordmark({
	width = "256px",
	...props
}: React.ImgHTMLAttributes<HTMLImageElement>) {
	return (
		<img
			src={ToCDNURL("/logos/logo-wordmark.png")}
			alt={TachiConfig.NAME}
			width={width}
			{...props}
		/>
	);
}

import { TachiConfig } from "lib/config";
import React from "react";

export default function SiteWordmark() {
	let title: React.ReactFragment = <>{TachiConfig.name}</>;
	let subtitle: string | undefined = undefined;
	if (TachiConfig.name === "Kamaitachi") {
		title = (
			<>
				<span className="text-primary fw-bold">Kamai</span>tachi
			</>
		);
		subtitle = "鎌鼬";
	} else if (TachiConfig.name === "Bokutachi") {
		title = (
			<>
				<span className="text-primary fw-bold">Boku</span>tachi
			</>
		);
		subtitle = "ぼくたち";
	}
	return (
		<div draggable="false" className="user-select-none">
			<h1 className="display-1 enable-rfs fw-semibold mb-n2">{title}</h1>
			{subtitle ? (
				<h4 className="text-body-secondary fst-italic text-end pe-4 enable-rfs">
					{subtitle}
				</h4>
			) : undefined}
		</div>
	);
}

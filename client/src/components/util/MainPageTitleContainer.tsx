import React from "react";
import SiteWordmark from "./SiteWordmark";

export default function MainPageTitleContainer({ title, desc }: { title: string; desc: string }) {
	return (
		<>
			<SiteWordmark />
			<div className="text-center mb-10 mb-lg-20">
				<h3 className="font-size-h1">{title}</h3>
				<span className="font-weight-bold text-dark-50">{desc}</span>
			</div>
		</>
	);
}

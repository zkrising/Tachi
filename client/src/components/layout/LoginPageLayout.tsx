import CenterPage from "components/util/CenterPage";
import SiteWordmark from "components/util/SiteWordmark";
import React from "react";
import { JustChildren } from "types/react";

export default function LoginPageLayout({
	children,
	heading,
	description,
}: { heading: string; description: React.ReactNode } & JustChildren) {
	return (
		<CenterPage className="gap-8 py-8" style={{ maxWidth: "576px" }}>
			<SiteWordmark />
			<div className="text-center mb-8">
				<h2>{heading}</h2>
				<span className="fw-semibold text-body-secondary">{description}</span>
			</div>
			{children}
		</CenterPage>
	);
}

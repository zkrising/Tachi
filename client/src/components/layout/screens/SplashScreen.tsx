import React from "react";
import Loading from "components/util/Loading";
import SplashImage from "../misc/SplashImage";

export function SplashScreen({ broke }: { broke: string }) {
	return (
		<div
			id="splash-screen"
			className="bg-body position-fixed inset-0 d-flex flex-column justify-content-center align-items-center"
		>
			<SplashImage />
			{!broke && <Loading />}
			{broke && <p className="mt-4">{broke}</p>}
		</div>
	);
}

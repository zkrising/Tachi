import { CircularProgress } from "@mui/material";
import React from "react";
import SplashImage from "../misc/SplashImage";

export function SplashScreen({ broke }: { broke: string }) {
	return (
		<div
			id="splash-screen"
			className="bg-body position-fixed inset-0 d-flex flex-column justify-content-center align-items-center"
		>
			<SplashImage />
			{!broke && <CircularProgress />}
			{broke && <p className="mt-4">{broke}</p>}
		</div>
	);
}

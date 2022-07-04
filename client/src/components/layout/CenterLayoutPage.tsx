import React from "react";
import { JustChildren } from "types/react";
import SplashImage from "./misc/SplashImage";

export default function CenterLayoutPage({ children }: JustChildren) {
	return (
		<div
			style={{
				position: "absolute",
				zIndex: 1000,
				width: "100%",
				height: "100%",
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				flexDirection: "column",
				backgroundColor: "#131313",
				textAlign: "center",
				fontSize: "2rem",
			}}
		>
			<div className="mb-8">
				<SplashImage />
			</div>

			{children}
		</div>
	);
}

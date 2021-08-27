import { BackgroundContext } from "context/BackgroundContext";
import React, { useContext } from "react";
import { ToServerURL } from "util/api";

export default function BackgroundImage() {
	const { background } = useContext(BackgroundContext);

	return (
		<div
			className="background-image"
			style={{
				backgroundImage: background
					? `url(${background})`
					: `url(${ToServerURL("/cdn/splashes/default.png")})`,
			}}
		></div>
	);
}

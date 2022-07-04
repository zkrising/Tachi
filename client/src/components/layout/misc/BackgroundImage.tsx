import { ToCDNURL } from "util/api";
import { BackgroundContext } from "context/BackgroundContext";
import React, { useContext } from "react";

export default function BackgroundImage() {
	const { background } = useContext(BackgroundContext);

	return (
		<div
			className="background-image"
			style={{
				backgroundImage: background
					? `url(${background})`
					: `url(${ToCDNURL("/game-banners/default")})`,
			}}
		></div>
	);
}

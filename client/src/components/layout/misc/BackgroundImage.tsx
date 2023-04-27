import { ToCDNURL } from "util/api";
import { BackgroundContext } from "context/BackgroundContext";
import React, { useContext } from "react";

export default function BackgroundImage() {
	const { background } = useContext(BackgroundContext);

	const backgroundImage = background
		? `url(${background})`
		: `url(${ToCDNURL("/game-banners/default")})`;

	return <div className="background-image" style={{ backgroundImage }} />;
}

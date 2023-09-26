import { ToCDNURL } from "util/api";
import { BackgroundContext } from "context/BackgroundContext";
import React, { useContext } from "react";
import { LayoutStyles } from "../Layout";

export default function BackgroundImage({ styles }: { styles: LayoutStyles }) {
	const { background } = useContext(BackgroundContext);
	return (
		<div
			style={{
				backgroundImage: background
					? `url(${background})`
					: `url(${ToCDNURL("/game-banners/default")})`,
				backgroundRepeat: "no-repeat",
				backgroundPosition: "center",
				backgroundSize: "cover",
				position: "absolute",
				top: `${styles.headerHeight}px`,
				width: "100%",
				height: styles.backgroundHeight,
				zIndex: "-1",
			}}
		/>
	);
}

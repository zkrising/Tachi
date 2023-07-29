import { ToCDNURL } from "util/api";
import { BackgroundContext } from "context/BackgroundContext";
import React, { useContext } from "react";
import { LayoutStyles } from "../Layout";

export default function BackgroundImage({ styles }: { styles: LayoutStyles }) {
	const { background } = useContext(BackgroundContext);
	return (
		<img
			src={background ? background : `${ToCDNURL("/game-banners/default")}`}
			height={styles.backgroundHeight}
			style={{
				marginTop: `${styles.headerHeight}px`,
				objectFit: "cover",
				width: "100%",
				zIndex: "-1",
				position: "absolute",
			}}
		/>
	);
}

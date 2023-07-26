import { ToCDNURL } from "util/api";
import { BackgroundContext } from "context/BackgroundContext";
import React, { useContext } from "react";
import { LayoutStyles } from "../Layout";

export default function BackgroundImage({ styles }: { styles: LayoutStyles }) {
	const { background } = useContext(BackgroundContext);
	return (
		<img
			className="position-absolute object-fit-cover w-full z-n1"
			src={background ? background : `${ToCDNURL("/game-banners/default")}`}
			height={styles.height}
			style={{ marginTop: styles.margin }}
		/>
	);
}

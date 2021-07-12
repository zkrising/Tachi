import { BackgroundContext } from "context/BackgroundContext";
import React, { useContext } from "react";

export default function BackgroundImage() {
	const { background } = useContext(BackgroundContext);

	if (!background) {
		return <></>;
	}

	return (
		<div
			className="background-image"
			style={{
				backgroundImage: `url(${background})`,
			}}
		></div>
	);
}

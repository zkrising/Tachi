import React, { CSSProperties } from "react";

export default function Icon({
	type,
	noPad,
	brand,
	onClick,
	colour,
	style,
	regular,
}: {
	type: string;
	noPad?: boolean;
	brand?: boolean;
	regular?: boolean;
	onClick?: () => void;
	colour?: "info" | "primary" | "danger" | "warning";
	style?: CSSProperties;
}) {
	return (
		<i
			onClick={onClick}
			className={`fa${regular ? "r" : brand ? "b" : "s"} fa-${type} ${noPad ? "p-0" : ""} ${
				colour ? `text-${colour}` : ""
			}`}
			style={style}
		/>
	);
}

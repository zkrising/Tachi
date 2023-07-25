import React from "react";
import { TextColour } from "types/bootstrap";

export default function Icon({
	type,
	noPad,
	brand,
	colour,
	regular,
	className = "",
	...props
}: {
	type: string;
	noPad?: boolean;
	brand?: boolean;
	regular?: boolean;
	colour?: TextColour;
} & React.HTMLAttributes<HTMLElement>) {
	// eslint-disable-next-line prettier/prettier
	const iconClassName = `fa${regular ? "r" : brand ? "b" : "s"} fa-${type}${noPad ? " p-0" : ""}${colour ? ` text-${colour}` : ""}`;
	return <i className={`${iconClassName + (className && " ") + className}`} {...props} />;
}

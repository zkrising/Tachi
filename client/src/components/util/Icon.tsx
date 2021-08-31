import React from "react";

export default function Icon({
	type,
	noPad,
	brand,
	onClick,
}: {
	type: string;
	noPad?: boolean;
	brand?: boolean;
	onClick?: () => void;
}) {
	return (
		<i
			onClick={onClick}
			className={`fa${brand ? "b" : "s"} fa-${type} ${noPad ? "p-0" : ""}`}
		/>
	);
}

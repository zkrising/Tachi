import React from "react";

export default function Icon({
	type,
	noPad,
	brand,
}: {
	type: string;
	noPad?: boolean;
	brand?: boolean;
}) {
	return <i className={`fa${brand ? "b" : "s"} fa-${type} ${noPad ? "p-0" : ""}`} />;
}

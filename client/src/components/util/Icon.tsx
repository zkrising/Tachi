import React from "react";

export default function Icon({ type, noPad }: { type: string; noPad?: boolean }) {
	return <i className={`fas fa-${type} ${noPad ? "p-0" : ""}`} />;
}

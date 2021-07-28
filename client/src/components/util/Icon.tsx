import React from "react";

export default function Icon({ type }: { type: string }) {
	return <i className={`fas fa-${type}`} />;
}

import React from "react";

export default function Divider({ className = "my-4" }: { className?: string }) {
	return (
		<div className={`border-bottom border-light border-opacity-10 ${className ?? ""}`}></div>
	);
}

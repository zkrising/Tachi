import React from "react";

export default function Divider({
	className = "my-4",
	size,
}: {
	className?: string;
	size?: "small" | "full" | "thick";
}) {
	return <div className={`divider ${size ? `${size} ` : ""}${className ?? ""}`}></div>;
}

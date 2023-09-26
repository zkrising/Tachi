import React from "react";
import { JustChildren } from "types/react";

export default function CenterPage({
	children,
	className = "",
	...props
}: React.HTMLAttributes<HTMLDivElement> & JustChildren) {
	return (
		<div
			className={`container d-flex flex-column min-vh-100 justify-content-center align-items-center ${className}`}
			{...props}
		>
			{children}
		</div>
	);
}

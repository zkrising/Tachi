import React from "react";
import { Link } from "react-router-dom";
import { JustChildren } from "types/react";

export default function LinkButton({
	to,
	className = "btn-primary",
	children,
}: {
	to: string;
	className?: string;
} & JustChildren) {
	return (
		<Link to={to} className={`btn ${className}`}>
			{children}
		</Link>
	);
}

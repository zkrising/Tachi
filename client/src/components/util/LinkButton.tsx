import React, { CSSProperties } from "react";
import { Link } from "react-router-dom";
import { JustChildren } from "types/react";

export default function LinkButton({
	to,
	className = "btn-primary",
	children,
	style,
	onClick,
}: {
	to: string;
	className?: string;
	style?: CSSProperties;
	onClick?: () => void;
} & JustChildren) {
	return (
		<Link onClick={onClick} to={to} className={`btn ${className}`} style={style}>
			{children}
		</Link>
	);
}

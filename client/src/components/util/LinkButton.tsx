import React, { CSSProperties } from "react";
import { Link } from "react-router-dom";
import { JustChildren } from "types/react";

export default function LinkButton({
	to,
	className = "btn-primary",
	children,
	style,
	onClick,
	disabled = false,
}: {
	to: string;
	className?: string;
	style?: CSSProperties;
	onClick?: () => void;
	disabled?: boolean;
} & JustChildren) {
	return (
		<Link
			onClick={onClick}
			to={to}
			className={`btn ${disabled ? "disabled" : ""} ${className}`}
			style={style}
		>
			{children}
		</Link>
	);
}

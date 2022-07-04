import React, { CSSProperties } from "react";
import { JustChildren } from "types/react";

export default function Card({
	header,
	children,
	footer,
	className,
	style,
}: {
	header: JSX.Element | string;
	footer?: JSX.Element | string;
	className?: string;
	style?: CSSProperties;
} & JustChildren) {
	return (
		<div className={`card card-custom ${className ? className : ""}`} style={style}>
			<div className="card-header">
				{typeof header === "string" ? (
					<h3 className="text-center mb-0">{header}</h3>
				) : (
					header
				)}
			</div>
			<div className="card-body">{children}</div>
			{footer && <div className="card-footer">{footer}</div>}
		</div>
	);
}

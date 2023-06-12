import React from "react";
import { JustChildren } from "types/react";

// The name of this component aged like fine milk.
// text-muted is depricated as of Bootstrap 5.3.0

/**A tool to quickly render muted text as both inline (by default) and block elements*/
export default function Muted({
	children,
	block,
	small,
	italic,
	className = "",
}: {
	/**Render a div element*/
	block?: boolean;
	/**Render a small element*/
	small?: boolean;
	/**Insert an italic class selector*/
	italic?: boolean;
	className?: string;
} & JustChildren) {
	let isItalic = "";
	let isSmall = "";
	if (italic) {
		isItalic = " fst-italic";
	}
	switch (true) {
		case block:
			if (small) {
				isSmall = " small";
			}
			return (
				<div className={`text-body-secondary${isItalic}${isSmall} ${className}`}>
					{children}
				</div>
			);
		case small:
			return (
				<small className={`text-body-secondary${isItalic} ${className}`}>{children}</small>
			);
		default:
			return (
				<span className={`text-body-secondary${isItalic} ${className}`}>{children}</span>
			);
	}
}

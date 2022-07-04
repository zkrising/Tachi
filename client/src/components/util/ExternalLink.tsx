import React from "react";

export default function ExternalLink({
	children,
	...props
}: React.DetailedHTMLProps<React.AnchorHTMLAttributes<HTMLAnchorElement>, HTMLAnchorElement>) {
	return (
		<a target="_blank" rel="noopener noreferrer" {...props}>
			{children}
		</a>
	);
}

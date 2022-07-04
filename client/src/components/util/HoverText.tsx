import React, { useState } from "react";

export default function HoverText({ hover, children }: { hover: string; children: string }) {
	const [hovering, setHovering] = useState(false);

	return (
		<span onMouseEnter={() => setHovering(true)} onMouseLeave={() => setHovering(false)}>
			{hovering ? hover : children}
		</span>
	);
}

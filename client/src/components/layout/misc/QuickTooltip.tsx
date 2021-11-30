import { nanoid } from "nanoid";
import React from "react";
import { OverlayTrigger, Tooltip } from "react-bootstrap";

export default function QuickTooltip({
	children,
	tooltipContent,
}: { tooltipContent: React.ReactChild } & { children: JSX.Element }) {
	return (
		<OverlayTrigger placement="top" overlay={<Tooltip id={nanoid()}>{tooltipContent}</Tooltip>}>
			{children}
		</OverlayTrigger>
	);
}

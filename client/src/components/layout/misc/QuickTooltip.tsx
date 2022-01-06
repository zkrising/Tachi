import { nanoid } from "nanoid";
import React, { CSSProperties } from "react";
import { OverlayTrigger, Tooltip } from "react-bootstrap";

export default function QuickTooltip({
	children,
	tooltipContent,
	wide,
}: {
	tooltipContent: React.ReactChild;
	wide?: boolean;
	children: JSX.Element;
}) {
	return (
		<OverlayTrigger
			placement="top"
			overlay={
				<Tooltip className={wide ? "tooltip-wide" : ""} id={nanoid()}>
					{tooltipContent}
				</Tooltip>
			}
		>
			{children}
		</OverlayTrigger>
	);
}

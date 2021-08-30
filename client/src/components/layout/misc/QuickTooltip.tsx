import { nanoid } from "nanoid";
import React from "react";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { JustChildren } from "types/react";

export default function QuickTooltip({
	children,
	text,
}: { text: string } & { children: JSX.Element }) {
	return (
		<OverlayTrigger placement="top" overlay={<Tooltip id={nanoid()}>{text}</Tooltip>}>
			{children}
		</OverlayTrigger>
	);
}

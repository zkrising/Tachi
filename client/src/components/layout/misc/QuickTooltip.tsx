import { nanoid } from "nanoid";
import React, { CSSProperties, useState } from "react";
import { OverlayTrigger, Tooltip } from "react-bootstrap";

export default function QuickTooltip({
	children,
	tooltipContent,
	wide,
	style,
	max,
}: {
	tooltipContent: React.ReactChild;
	wide?: boolean;
	max?: boolean;
	style?: CSSProperties;
	children: JSX.Element;
}) {
	const [show, setShow] = useState(false);
	const [mousedOver, setMousedOver] = useState(false);

	return (
		<OverlayTrigger
			placement="top"
			show={show || mousedOver}
			overlay={
				<Tooltip
					style={style}
					className={wide ? "tooltip-wide" : ` ${max ? "tooltip-max" : ""}`}
					id={nanoid()}
					onMouseEnter={() => setMousedOver(true)}
					onMouseLeave={() => setMousedOver(false)}
				>
					{tooltipContent}
				</Tooltip>
			}
			onToggle={(nextShow) => setShow(nextShow)}
		>
			{children}
		</OverlayTrigger>
	);
}

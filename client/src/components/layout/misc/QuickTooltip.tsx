import { nanoid } from "nanoid";
import React, { CSSProperties } from "react";
import Popover from "react-bootstrap/Popover";
import OverlayTrigger, { OverlayTriggerType } from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";
import { Placement } from "react-bootstrap/esm/types";
import { Offset } from "@restart/ui/esm/usePopper";

export default function QuickTooltip({
	children,
	id = nanoid(),
	tooltipClassName = "",
	delay = 40,
	placement = "auto",
	trigger,
	onToggle,
	show,
	flip,
	tooltipContent,
	tooltipStyle = {},
	tooltipOffset = [0, 6],
}: {
	children: JSX.Element;
	id?: string;
	tooltipClassName?: string;
	/**Default: 40*/
	delay?: number;
	/**Refer to OverlayTrigger from react-bootstrap v2 for valid values*/
	placement?: Placement;
	/**"hover" | "click" | "focus"*/
	trigger?: OverlayTriggerType | OverlayTriggerType[];
	/**A callback that fires when the tooltip is triggered after the set delay.*/
	onToggle?: (nextShow: boolean) => void;
	/**Manually trigger the tooltip. Directly controlling show bypasses the delay value.*/
	show?: boolean;
	flip?: boolean;
	tooltipContent: React.ReactChild | undefined;
	tooltipStyle?: CSSProperties;
	/**https://popper.js.org/docs/v2/modifiers/offset/*/
	tooltipOffset?: Offset;
}) {
	if (tooltipContent === undefined || tooltipContent === null || tooltipContent === <></>) {
		return children;
	}

	return (
		<OverlayTrigger
			placement={placement}
			delay={delay}
			trigger={trigger}
			onToggle={onToggle}
			show={show}
			flip={flip}
			offset={tooltipOffset}
			overlay={
				<Tooltip className={tooltipClassName} id={id} style={tooltipStyle}>
					{tooltipContent}
				</Tooltip>
			}
		>
			{children}
		</OverlayTrigger>
	);
}

export function QuickPopover({
	children,
	id = nanoid(),
	className = "",
	delay = 40,
	placement = "auto",
	trigger,
	onToggle,
	show,
	flip,
	popoverHeader,
	popoverContent,
	popoverStyle,
}: {
	children: JSX.Element;
	id?: string;
	className?: string;
	/**Default: 40*/
	delay?: number;
	/**Refer to OverlayTrigger from react-bootstrap v2 for valid values*/
	placement?: Placement;
	/**"hover" | "click" | "focus"*/
	trigger?: OverlayTriggerType | OverlayTriggerType[];
	/**A callback that fires when the popover is triggered after the set delay.*/
	onToggle?: (nextShow: boolean) => void;
	/**Manually trigger the popover. Directly controlling show bypasses the delay value.*/
	show?: boolean;
	flip?: boolean;
	popoverHeader: string;
	popoverContent: React.ReactChild | undefined;
	popoverStyle?: CSSProperties;
}) {
	if (popoverContent === undefined) {
		return children;
	}

	return (
		<OverlayTrigger
			placement={placement}
			delay={delay}
			trigger={trigger}
			onToggle={onToggle}
			show={show}
			flip={flip}
			overlay={
				<Popover className={className} id={id} style={popoverStyle}>
					{popoverHeader ? <Popover.Header>{popoverHeader}</Popover.Header> : <></>}
					<Popover.Body>{popoverContent}</Popover.Body>
				</Popover>
			}
		>
			{children}
		</OverlayTrigger>
	);
}

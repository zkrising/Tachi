import { nanoid } from "nanoid";
import React from "react";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";

export default function QuickTooltip({
	children,
	tooltipContent,
	className,
	delay = 40,
	placement = "top",
	trigger,
}: {
	children: JSX.Element;
	tooltipContent: React.ReactChild | undefined;
	className?: string;
	delay?: number;
	placement?:
		| "auto-start"
		| "auto"
		| "auto-end"
		| "top-start"
		| "top"
		| "top-end"
		| "right-start"
		| "right"
		| "right-end"
		| "bottom-end"
		| "bottom"
		| "bottom-start"
		| "left-end"
		| "left"
		| "left-start";
	trigger?: "hover" | "click" | "focus" | Array<"hover" | "click" | "focus">;
}) {
	if (tooltipContent === undefined) {
		return children;
	}

	return (
		<OverlayTrigger
			placement={placement}
			delay={delay}
			trigger={trigger}
			overlay={
				<Tooltip className={`${className ?? ""}`} id={nanoid()}>
					{tooltipContent}
				</Tooltip>
			}
		>
			{children}
		</OverlayTrigger>
	);
}

// TODO
/* export function QuickPopover({ 
	children,
	tooltipContent,
	className,
	delay = 40,
	placement,
}: {
	children: JSX.Element;
	tooltipContent: React.ReactChild | undefined;
	className?: string;
	delay?: number;
	placement?: string;
}) {
	const [show, setShow] = useState(false);
	const [mousedOver, setMousedOver] = useState(false);

	if (tooltipContent === undefined) {
		return children;
	}

	return (
		<OverlayTrigger
			placement={`${placement ? (`${placement}` as Placement) : ("top" as Placement)}`}
			show={show || mousedOver}
			delay={delay}
			overlay={
				<Popover
					className={`${className ?? ""}`}
					id={nanoid()}
					onMouseEnter={() => setMousedOver(true)}
					onMouseLeave={() => setMousedOver(false)}
				>
					{popoverContent}
				</Popover>
			}
			onToggle={(nextShow) => setShow(nextShow)}
		>
			{children}
		</OverlayTrigger>
	);
} */

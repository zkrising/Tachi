import React from "react";
import { OverlayTrigger } from "react-bootstrap";
import { Link } from "react-router-dom";
import QuickTooltip from "../misc/QuickTooltip";

export default function CardNavButton({
	type,
	to,
	hoverText,
}: {
	type: string;
	to: string;
	hoverText?: string;
}) {
	if (!hoverText) {
		return <Link className={`fas fa-${type} h3 card-nav-icon`} to={to} />;
	}

	return (
		<QuickTooltip text={hoverText}>
			<Link className={`fas fa-${type} h3 card-nav-icon`} to={to} />
		</QuickTooltip>
	);
}

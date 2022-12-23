import { Tab } from "@mui/material";
import React from "react";
import { Link } from "react-router-dom";

export default function NavItem({
	to,
	children,
}: {
	to: string;
	otherMatchingPaths?: Array<string>;
	children: string;
}) {
	return (
		// @ts-expect-error Faulty types from MUI. The to={to} here is necessary
		// and works perfectly fine, but the MUI types disagree that it exists.
		<Tab
			label={<span className="mx-4">{children}</span>}
			LinkComponent={Link}
			to={to}
			style={{ opacity: 1 }}
		/>
	);
}

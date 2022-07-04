import React from "react";
import { Link } from "react-router-dom";
import { JustChildren } from "types/react";

export default function NavItem({ to, children }: JustChildren & { to: string }) {
	return (
		<Link to={to} className="MuiButtonBase-root MuiTab-root navbar-link" type="button">
			<span className="MuiTab-wrapper">{children}</span>
		</Link>
	);
}

import React from "react";
import DropdownItem from "react-bootstrap/DropdownItem";
import { NavLink, NavLinkProps } from "react-router-dom";

export default function DropdownNavLink({
	to,
	children,
	...props
}: { to: string; children: React.ReactNode } & NavLinkProps) {
	return (
		<DropdownItem as={NavLink} to={to} {...props}>
			{children}
		</DropdownItem>
	);
}

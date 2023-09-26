import React from "react";
import { NavLink } from "react-router-dom";
import Nav from "react-bootstrap/Nav";
import { NavLinkProps } from "react-bootstrap";

export default function MenuLink({
	name,
	to,
	...props
}: { name: string; to: string } & NavLinkProps) {
	return (
		<Nav.Item>
			<Nav.Link as={NavLink} to={to} {...props}>
				{name}
			</Nav.Link>
		</Nav.Item>
	);
}

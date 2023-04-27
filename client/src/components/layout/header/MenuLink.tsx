import React from "react";
import { NavLink } from "react-router-dom";

export default function MenuLink({ name, to }: { name: string; to: string }) {
	return (
		<NavLink to={to} className="nav-link">
			{name}
		</NavLink>
	);
}

export function DropdownLink({ name, to }: { name: string; to: string }) {
	return (
		<NavLink to={to} className="dropdown-item">
			{name}
		</NavLink>
	);
}

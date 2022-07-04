import React from "react";
import { NavLink } from "react-router-dom";

export default function MenuLink({ name, to }: { name: string; to: string }) {
	return (
		<li className="menu-item">
			<NavLink className="menu-link" to={to}>
				<span className="menu-text">{name}</span>
			</NavLink>
		</li>
	);
}

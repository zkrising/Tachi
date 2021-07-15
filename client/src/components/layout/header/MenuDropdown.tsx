import React from "react";
import { JustChildren } from "types/react";

export default function MenuDropdown({ name, children }: { name: string } & JustChildren) {
	return (
		<li
			data-menu-toggle="click"
			aria-haspopup="true"
			className="menu-item menu-item-submenu menu-item-rel menu-item-open-dropdown"
		>
			<div className="menu-link menu-toggle">
				<span className="menu-text">{name}</span>
				<i className="menu-arrow" />
			</div>
			<div className="menu-submenu menu-submenu-classic menu-submenu-left">
				<ul className="menu-subnav">{children}</ul>
			</div>
		</li>
	);
}

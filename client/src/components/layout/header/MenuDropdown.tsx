import useComponentVisible from "components/util/useComponentVisible";
import React from "react";
import { JustChildren } from "types/react";

export default function MenuDropdown({ name, children }: { name: string } & JustChildren) {
	const { ref, isComponentVisible, setIsComponentVisible } = useComponentVisible(false);

	return (
		<li
			ref={ref}
			data-menu-toggle="click"
			aria-haspopup="true"
			className={`menu-item menu-item-submenu menu-item-rel menu-item-open-dropdown ${
				isComponentVisible ? "menu-item-active-tab" : ""
			}`}
			onClick={() => setIsComponentVisible(!isComponentVisible)}
		>
			<div className="menu-link menu-toggle">
				<span className="menu-text">{name}</span>
				<i className="menu-arrow" />
			</div>
			<div
				style={{
					display: isComponentVisible ? "block" : "none",
				}}
				className="menu-submenu menu-submenu-classic menu-submenu-left"
			>
				<ul className="menu-subnav">{children}</ul>
			</div>
		</li>
	);
}

// .header-menu .menu-nav .menu-item.menu-item-active-tab .menu-submenu, .header-menu .menu-nav .menu-item.menu-item-hover .menu-submenu

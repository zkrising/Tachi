import Navbar from "components/nav/Navbar";
import NavItem from "components/nav/NavItem";
import React from "react";

export function DashboardHeader() {
	const navItems = [
		<NavItem key="activity" to="/">
			Activity
		</NavItem>,
		<NavItem key="activity" to="/calendar">
			Calendar
		</NavItem>,
		<NavItem key="profiles" to="/profiles">
			Your Profiles
		</NavItem>,
		<NavItem key="profiles" to="/global-activity">
			Global Activity
		</NavItem>,
	];

	return (
		<div className="align-items-center mb-0">
			<Navbar>{navItems}</Navbar>
		</div>
	);
}

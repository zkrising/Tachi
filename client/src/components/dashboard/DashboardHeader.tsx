import Navbar from "components/nav/Navbar";
import NavItem from "components/nav/NavItem";
import React from "react";

export function DashboardHeader() {
	const navItems = [
		<NavItem key="activity" to="/dashboard">
			Activity
		</NavItem>,
		<NavItem key="profiles" to="/dashboard/profiles">
			Your Profiles
		</NavItem>,
		<NavItem key="profiles" to="/dashboard/global-activity">
			Global Activity
		</NavItem>,
	];

	return (
		<div className="row align-items-center mb-0">
			<Navbar>{navItems}</Navbar>
		</div>
	);
}

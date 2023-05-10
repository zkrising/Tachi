import Navbar from "components/nav/Navbar";
import React from "react";

export default function DashboardHeader() {
	const navItems = [
		<Navbar.Item to="/">Activity</Navbar.Item>,
		<Navbar.Item to="/calendar">Calendar</Navbar.Item>,
		<Navbar.Item to="/profiles">Your Profiles</Navbar.Item>,
		<Navbar.Item to="/global-activity">Global Activity</Navbar.Item>,
	];

	return <Navbar>{navItems}</Navbar>;
}

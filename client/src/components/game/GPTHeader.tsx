import Navbar from "components/nav/Navbar";
import NavItem from "components/nav/NavItem";
import { UserSettingsContext } from "context/UserSettingsContext";
import React, { useContext } from "react";

export function GPTBottomNav({ baseUrl }: { baseUrl: string }) {
	const { settings } = useContext(UserSettingsContext);

	const navItems = [
		<NavItem key="activity" to={`${baseUrl}/`}>
			Activity
		</NavItem>,
		<NavItem key="songs" to={`${baseUrl}/songs`}>
			Songs
		</NavItem>,
		<NavItem key="leaderboards" to={`${baseUrl}/leaderboards`}>
			Leaderboards
		</NavItem>,
		<NavItem
			key="quests"
			to={`${baseUrl}/quests`}
			otherMatchingPaths={[`${baseUrl}/questline`]}
		>
			Quests
		</NavItem>,
	];

	if (settings?.preferences.developerMode) {
		navItems.push(
			<NavItem key="dev-info" to={`${baseUrl}/dev-info`}>
				Developer Info
			</NavItem>
		);
	}

	return (
		<div className="align-items-center mb-0">
			<Navbar>{navItems}</Navbar>
		</div>
	);
}

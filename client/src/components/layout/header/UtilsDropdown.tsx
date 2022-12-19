import React from "react";
import MenuDropdown from "./MenuDropdown";
import MenuLink from "./MenuLink";

export default function UtilsDropdown() {
	return (
		<MenuDropdown name="Developer Utils">
			<MenuLink to="/utils/seeds" name="Seeds Management" />
			<MenuLink to="/utils/imports" name="Import Management" />
			<MenuLink to="/utils/quests" name="Quest Creator" />
		</MenuDropdown>
	);
}

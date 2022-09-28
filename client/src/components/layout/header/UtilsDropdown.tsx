import React from "react";
import MenuDropdown from "./MenuDropdown";
import MenuLink from "./MenuLink";

export default function UtilsDropdown() {
	return (
		<MenuDropdown name="Developer Utils">
			<MenuLink to="/dashboard/utils/seeds" name="Seeds Management" />
		</MenuDropdown>
	);
}

import React from "react";
import NavDropdown from "react-bootstrap/NavDropdown";
import { DropdownLink } from "./MenuLink";

export default function UtilsDropdown() {
	return (
		<NavDropdown
			id="Developer Utils"
			title="Developer Utils"
			bsPrefix="header-link btn btn-header"
		>
			<DropdownLink to="/utils/seeds" name="Seeds Management" />
			<DropdownLink to="/utils/imports" name="Import Management" />
			<DropdownLink to="/utils/quests" name="Quest Creator" />
		</NavDropdown>
	);
}

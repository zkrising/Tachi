import React from "react";
import NavDropdown from "react-bootstrap/NavDropdown";
import { Link } from "react-router-dom";

export default function UtilsDropdown() {
	return (
		<NavDropdown
			id="Developer Utils"
			title="Developer Utils"
			bsPrefix="header-link btn btn-header"
		>
			<NavDropdown.Item as={Link} to="/utils/seeds">
				Seeds Management
			</NavDropdown.Item>
			<NavDropdown.Item as={Link} to="/utils/imports">
				Import Management
			</NavDropdown.Item>
			<NavDropdown.Item as={Link} to="/utils/quests">
				Quest Creator
			</NavDropdown.Item>
		</NavDropdown>
	);
}

import React from "react";
import NavDropdown from "react-bootstrap/NavDropdown";
import { Link } from "react-router-dom";

export default function UtilsDropdown({ onClick }: { onClick?: () => void }) {
	return (
		<NavDropdown id="developer-utils" title="Developer Utils" className="header-dropdown">
			<NavDropdown.Item
				className="rounded my-1"
				onClick={() => {
					onClick?.();
				}}
				as={Link}
				to="/utils/seeds"
			>
				Seeds Management
			</NavDropdown.Item>
			<NavDropdown.Item
				className="rounded my-1"
				onClick={() => {
					onClick?.();
				}}
				as={Link}
				to="/utils/imports"
			>
				Import Management
			</NavDropdown.Item>
			<NavDropdown.Item
				className="rounded my-1"
				onClick={() => {
					onClick?.();
				}}
				as={Link}
				to="/utils/quests"
			>
				Quest Creator
			</NavDropdown.Item>
		</NavDropdown>
	);
}

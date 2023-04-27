import NavItem from "react-bootstrap/NavItem";
import Icon from "components/util/Icon";
import React from "react";
import { Link } from "react-router-dom";

export function SearchButton() {
	return (
		<NavItem>
			<Link to="/search" className="btn btn-header btn-icon">
				<Icon type="search" colour="muted" />
			</Link>
		</NavItem>
	);
}

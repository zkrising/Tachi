import { UserProfileDropdown } from "components/layout/header/UserProfileDropdown";
import LinkButton from "components/util/LinkButton";
import { UserContext } from "context/UserContext";
import React, { useContext } from "react";
import { Link } from "react-router-dom";
import NavItem from "react-bootstrap/NavItem";
import Icon from "components/util/Icon";
import { UserNotificationButton } from "./UserNotificationButton";

export function Endbar() {
	const { user } = useContext(UserContext);

	return (
		<div id="endbar" className={"d-flex justify-content-end align-items-center"}>
			<NavItem>
				<Link to="/search" className="btn btn-header btn-icon">
					<Icon type="search" colour="muted" />
				</Link>
			</NavItem>

			{user ? (
				<>
					<UserNotificationButton user={user} />
					<UserProfileDropdown user={user} />
				</>
			) : (
				<>
					<div className="me-3">
						<LinkButton to="/login" className="btn-outline-primary">
							Log In
						</LinkButton>
					</div>
					<div>
						<LinkButton to="/register">Create Account</LinkButton>
					</div>
				</>
			)}
		</div>
	);
}

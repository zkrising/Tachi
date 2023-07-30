import { UserProfileDropdown } from "components/layout/header/UserProfileDropdown";
import LinkButton from "components/util/LinkButton";
import { UserContext } from "context/UserContext";
import React, { useContext } from "react";
import { UserNotificationButton } from "./UserNotificationButton";
import { SearchButton } from "./SearchButton";

export function Topbar() {
	const { user } = useContext(UserContext);

	return (
		<div className="topbar" style={{ minWidth: "35%" }}>
			<SearchButton />

			{user ? (
				<>
					<UserNotificationButton />
					<UserProfileDropdown user={user} />
				</>
			) : (
				<>
					<div className="topbar-item me-3">
						<LinkButton to="/login" className="btn-outline-primary">
							Log In
						</LinkButton>
					</div>
					<div className="topbar-item">
						<LinkButton to="/register">Create Account</LinkButton>
					</div>
				</>
			)}
		</div>
	);
}

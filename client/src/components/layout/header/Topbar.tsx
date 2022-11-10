import { UserProfileDropdown } from "components/layout/header/UserProfileDropdown";
import LinkButton from "components/util/LinkButton";
import { UserContext } from "context/UserContext";
import React, { useContext } from "react";
import SearchBar from "./SearchBar";
import { UserNotificationButton } from "./UserNotificationButton";

export function Topbar() {
	const { user } = useContext(UserContext);

	return (
		<div className="topbar" style={{ minWidth: "35%" }}>
			<SearchBar />

			{user ? (
				<>
					<UserNotificationButton user={user} />
					<UserProfileDropdown user={user} />
				</>
			) : (
				<>
					<div className="topbar-item mr-3">
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

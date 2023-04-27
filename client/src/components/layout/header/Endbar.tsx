import { UserProfileDropdown } from "components/layout/header/UserProfileDropdown";
import LinkButton from "components/util/LinkButton";
import { UserContext } from "context/UserContext";
import React, { useContext } from "react";
import { UserNotificationButton } from "./UserNotificationButton";
import { SearchButton } from "./SearchButton";

export function Endbar() {
	const { user } = useContext(UserContext);

	return (
		<div className={"endbar d-flex justify-flex-end align-items-center"}>
			<SearchButton />

			{user ? (
				<>
					<UserNotificationButton user={user} />
					<UserProfileDropdown user={user} />
				</>
			) : (
				<>
					<div className="endbar-item me-3">
						<LinkButton to="/login" className="btn-outline-primary">
							Log In
						</LinkButton>
					</div>
					<div className="endbar-item">
						<LinkButton to="/register">Create Account</LinkButton>
					</div>
				</>
			)}
		</div>
	);
}

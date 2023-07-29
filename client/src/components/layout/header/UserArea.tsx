import React from "react";
import LinkButton from "components/util/LinkButton";
import { UserDocument } from "tachi-common/types/documents";
import { ProfilePictureSmall } from "components/user/ProfilePicture";
import { UserNotificationButton } from "./UserNotificationButton";
import { UserProfileDropdown } from "./UserProfileDropdown";
import { SearchButton } from "./SearchButton";

export default function UserArea({
	user,
	dropdownMenuStyle,
}: {
	user: UserDocument | null;
	dropdownMenuStyle?: React.CSSProperties;
}) {
	return (
		<div className="d-flex align-items-center gap-2">
			<SearchButton />
			{!user || user === null ? (
				<>
					<LinkButton to="/login" variant="outline-primary" className="me-2">
						Log In
					</LinkButton>
					<LinkButton to="/register">Create Account</LinkButton>
				</>
			) : (
				<>
					<UserNotificationButton />
					<UserProfileDropdown style={dropdownMenuStyle} user={user} />
					<div className="h-14 w-14 d-flex d-lg-none justify-content-center align-items-center">
						{/* a temporary solution */}
						<ProfilePictureSmall user={user} />
					</div>
				</>
			)}
		</div>
	);
}

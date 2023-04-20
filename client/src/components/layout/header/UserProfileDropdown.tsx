import { RFA } from "util/misc";
import { heySplashes } from "util/splashes";
import Divider from "components/util/Divider";
import Icon from "components/util/Icon";
import React, { useState } from "react";
import { UserDocument } from "tachi-common";
import SupporterIcon from "components/util/SupporterIcon";
import SignOut from "components/util/SignOut";
import QuickDropdown from "components/ui/QuickDropdown";
import { TextColour } from "types/bootstrap";
import DropdownNavLink from "components/ui/DropdownNavLink";
import ProfilePicture from "components/user/ProfilePicture";

function UserProfileDropdownToggle({ user }: { user: UserDocument }) {
	const [heySplash] = useState(RFA(heySplashes));
	return (
		<>
			<div className="me-3 d-none d-lg-block">
				<span className="text-body-secondary">{heySplash}, </span>
				{user.username}
				{user.isSupporter && (
					<>
						{" "}
						<SupporterIcon />
					</>
				)}
			</div>
			<ProfilePicture size="sm" link={false} user={user} />
		</>
	);
}

function UserProfileMenuItem({
	to,
	id,
	iconType,
	iconColour,
	children,
}: {
	to: string;
	id: string;
	iconType: string;
	iconColour: TextColour;
	children: React.ReactNode;
}) {
	return (
		<DropdownNavLink
			to={to}
			id={id}
			isActive={() => false}
			className="d-flex align-items-center gap-6 p-4 text-wrap"
			style={{ minWidth: "30rem" }}
		>
			<span className="display-6">
				<Icon type={iconType} colour={iconColour} />
			</span>
			<div>{children}</div>
		</DropdownNavLink>
	);
}

export function UserProfileDropdown({
	user,
	style,
}: {
	user: UserDocument;
	style?: React.CSSProperties;
}) {
	return (
		<QuickDropdown
			variant="clear"
			align="end"
			id="user-profile-dropdown"
			toggle={<UserProfileDropdownToggle user={user} />}
			dropdownClassName="d-none d-lg-block"
			menuStyle={style}
			menuClassName="p-4"
		>
			<div className="d-flex flex-column gap-2">
				<UserProfileMenuItem
					id="my-profile"
					to={`/u/${user.username}`}
					iconType="user"
					iconColour="primary"
				>
					<div className="fw-semibold text-body">My Profile</div>
					<div className="text-body-secondary">View your profile!</div>
				</UserProfileMenuItem>
				<UserProfileMenuItem
					id="profile-settings"
					to={`/u/${user.username}/settings`}
					iconType="cog"
					iconColour="info"
				>
					<div className="fw-semibold text-body">Profile Settings</div>
					<div className="text-body-secondary">
						Manage your profile picture, status, and more!
					</div>
				</UserProfileMenuItem>
				<UserProfileMenuItem
					id="my-integrations"
					to={`/u/${user.username}/integrations`}
					iconType="wrench"
					iconColour="danger"
				>
					<div className="fw-semibold text-body">My Integrations</div>
					<div className="text-body-secondary">
						Manage your API Keys and integrations with other services.
					</div>
				</UserProfileMenuItem>

				<Divider className="my-2" />
				<SignOut className="align-self-end mb-2 mt-2" />
			</div>
		</QuickDropdown>
	);
}

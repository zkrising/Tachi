import Divider from "components/util/Divider";
import React, { useContext } from "react";
import { PublicUserDocument } from "tachi-common";
import ProfilePicture from "./ProfilePicture";
import Navbar from "components/nav/Navbar";
import NavItem from "components/nav/NavItem";
import ProfileBadges from "./ProfileBadges";
import { UserContext } from "context/UserContext";
import Muted from "components/util/Muted";

export function UserHeaderBody({ reqUser }: { reqUser: PublicUserDocument }) {
	return (
		<>
			<div className="col-12 col-lg-3">
				<div className="d-flex justify-content-center mb-3">
					<ProfilePicture user={reqUser} />
				</div>
				<div className="d-flex align-items-center" style={{ flexDirection: "column" }}>
					<ProfileBadges badges={reqUser.badges} />
				</div>
				<div className="d-block d-lg-none">
					<Divider className="mt-4 mb-4" />
				</div>
			</div>
			<div className="col-12 col-lg-6 d-flex justify-content-center">{reqUser.about}</div>
			<div className="col-12 col-lg-3 d-flex justify-content-center">
				<Muted>UserID: {reqUser.id}</Muted>
			</div>
		</>
	);
}

export function UserBottomNav({
	baseUrl,
	reqUser,
}: {
	baseUrl: string;
	reqUser: PublicUserDocument;
}) {
	const { user } = useContext(UserContext);

	const isRequestedUser = !!(user && user.id === reqUser.id);

	const navItems = [
		<NavItem key="about" to={`${baseUrl}/`}>
			Overview
		</NavItem>,
		<NavItem key="games" to={`${baseUrl}/games`}>
			Games
		</NavItem>,
	];

	if (isRequestedUser) {
		navItems.push(
			<NavItem key="settings" to={`${baseUrl}/settings`}>
				Settings
			</NavItem>
		);
	}

	return (
		<div className="row align-items-center mb-0">
			<Navbar>{navItems}</Navbar>
		</div>
	);
}

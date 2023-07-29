import React from "react";
import { UserBadges, UserDocument } from "tachi-common";
import { Badge } from "react-bootstrap";

export default function ProfileBadges({ user }: { user: UserDocument }) {
	return (
		<>
			{user.badges.map((e, i) => (
				<span key={i} className="mt-1">
					<ProfileBadge bg={e} />
				</span>
			))}
			{user.isSupporter && (
				<span className="mt-1">
					<Badge bg="warning">Supporter!</Badge>
				</span>
			)}
		</>
	);
}

export function ProfileBadge({ bg }: { bg: UserBadges }) {
	if (bg === "alpha") {
		return <Badge bg="warning">Alpha Tester</Badge>;
	} else if (bg === "beta") {
		return <Badge bg="info">Beta Tester</Badge>;
	} else if (bg === "dev-team") {
		return <Badge bg="primary">Dev Team</Badge>;
	} else if (bg === "contributor") {
		// discord contributor colour
		return <Badge style={{ backgroundColor: "#1abc9c" }}>Contributor</Badge>;
	} else if (bg === "significant-contributor") {
		// discord sig. contributor colour
		return <Badge style={{ backgroundColor: "#e62e22" }}>Significant Contributor</Badge>;
	}
	return <></>;
}

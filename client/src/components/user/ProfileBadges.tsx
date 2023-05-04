import React from "react";
import { UserBadges, UserDocument } from "tachi-common";
import { Badge } from "react-bootstrap";

export default function ProfileBadges({ user }: { user: UserDocument }) {
	return (
		<>
			{user.badges.map((e, i) => (
				<span key={i} className="mt-2">
					<ProfileBadge variant={e} />
				</span>
			))}
			{user.isSupporter && (
				<span className="mt-2">
					<Badge bg="warning">Supporter!</Badge>
				</span>
			)}
		</>
	);
}

export function ProfileBadge({ variant }: { variant: UserBadges }) {
	if (variant === "alpha") {
		return <Badge bg="warning">Alpha Tester</Badge>;
	} else if (variant === "beta") {
		return <Badge bg="info">Beta Tester</Badge>;
	} else if (variant === "dev-team") {
		return <Badge bg="primary">Dev Team</Badge>;
	} else if (variant === "contributor") {
		// discord contributor colour
		return <Badge style={{ backgroundColor: "#1abc9c" }}>Contributor</Badge>;
	} else if (variant === "significant-contributor") {
		// discord sig. contributor colour
		return <Badge style={{ backgroundColor: "#e62e22" }}>Significant Contributor</Badge>;
	}

	return <></>;
}

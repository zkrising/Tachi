import React from "react";
import { UserBadges } from "tachi-common";
import { Badge } from "react-bootstrap";

export default function ProfileBadges({ badges }: { badges: UserBadges[] }) {
	return (
		<>
			{badges.map((e, i) => (
				<span key={i} className="mt-1">
					<ProfileBadge variant={e} />
				</span>
			))}
		</>
	);
}

export function ProfileBadge({ variant }: { variant: UserBadges }) {
	if (variant === "alpha") {
		return <Badge variant="warning">Alpha Tester</Badge>;
	} else if (variant === "beta") {
		return <Badge variant="info">Beta Tester</Badge>;
	} else if (variant === "dev-team") {
		return <Badge variant="primary">Dev Team</Badge>;
	} else if (variant === "contributor") {
		// discord contributor colour
		return <Badge style={{ backgroundColor: "#1abc9c" }}>Contributor</Badge>;
	} else if (variant === "significant-contributor") {
		// discord sig. contributor colour
		return <Badge style={{ backgroundColor: "#e62e22" }}>Significant Contributor</Badge>;
	}

	return <></>;
}

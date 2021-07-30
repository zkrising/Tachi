import React from "react";
import { UserBadges } from "tachi-common";

export default function ProfileBadges({ badges }: { badges: UserBadges[] }) {
	return (
		<>
			{badges.map((e, i) => (
				<ProfileBadge key={i} variant={e} />
			))}
		</>
	);
}

export function ProfileBadge({ variant }: { variant: UserBadges }) {
	if (variant === "alpha") {
		return <div className="badge badge-success mt-1">Alpha Tester</div>;
	} else if (variant === "beta") {
		return <div className="badge badge-info mt-1">Beta Tester</div>;
	} else if (variant === "devTeam") {
		return <div className="badge badge-primary mt-1">Dev Team</div>;
	}

	return <></>;
}

import React from "react";
import { UserBadges, UserDocument } from "tachi-common";
import Badge from "react-bootstrap/Badge";

export default function ProfileBadges({ user }: { user: UserDocument }) {
	return (
		<>
			{user.badges.map((e, i) => (
				<span key={i} className="my-1 me-2 me-lg-0 ms-lg-2">
					<ProfileBadge key={i} variant={e} />
				</span>
			))}
		</>
	);
}

export function ProfileBadge({ variant }: { variant: UserBadges }) {
	if (variant === "alpha") {
		return (
			<Badge
				className="rounded-1"
				bg="warning"
				style={{ padding: "0.165rem 0.5rem", lineHeight: 1.5 }}
			>
				Alpha Tester
			</Badge>
		);
	} else if (variant === "beta") {
		return (
			<Badge
				className="rounded-1"
				bg="info"
				style={{ padding: "0.165rem 0.5rem", lineHeight: 1.5 }}
			>
				Beta Tester
			</Badge>
		);
	} else if (variant === "dev-team") {
		return (
			<Badge
				className="rounded-1"
				bg="primary"
				style={{ padding: "0.165rem 0.5rem", lineHeight: 1.5 }}
			>
				Dev Team
			</Badge>
		);
	} else if (variant === "contributor") {
		// discord contributor colour
		return (
			<Badge
				className="rounded-1"
				style={{ backgroundColor: "#1abc9c", padding: "0.165rem 0.5rem", lineHeight: 1.5 }}
			>
				Contributor
			</Badge>
		);
	} else if (variant === "significant-contributor") {
		// discord sig. contributor colour
		return (
			<Badge
				className="rounded-1"
				style={{ backgroundColor: "#e62e22", padding: "0.165rem 0.5rem", lineHeight: 1.5 }}
			>
				Significant Contributor
			</Badge>
		);
	}

	return <></>;
}

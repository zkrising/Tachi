import React from "react";
import { PublicUserDocument } from "tachi-common";
import { ToAPIURL } from "util/api";

export default function ProfilePicture({ user, src }: { user: PublicUserDocument; src?: string }) {
	return (
		<img
			src={src ? src : ToAPIURL(`/users/${user.id}/pfp`)}
			alt={`${user.username}'s Profile Picture`}
			className="rounded"
			style={{
				width: "128px",
				height: "128px",
				boxShadow: "0px 0px 10px 0px #000000",
			}}
		/>
	);
}

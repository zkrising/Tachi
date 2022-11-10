import { ToAPIURL } from "util/api";
import React from "react";
import { UserDocument } from "tachi-common";

export default function ProfilePicture({
	user,
	src,
}: {
	user: UserDocument | string;
	src?: string;
}) {
	if (typeof user === "string") {
		return (
			<img
				src={src ? src : ToAPIURL(`/users/${user}/pfp`)}
				alt={`${user}'s Profile Picture`}
				className="rounded"
				style={{
					width: "128px",
					height: "128px",
					boxShadow: "0px 0px 10px 0px #000000",
				}}
			/>
		);
	}

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

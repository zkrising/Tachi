import { ToAPIURL } from "util/api";
import React from "react";
import { UserDocument } from "tachi-common";
import { Link } from "react-router-dom";

export default function ProfilePicture({
	user,
	src: imgUrl,
	toGPT = "",
	link = true,
	size = "lg",
}: {
	user: UserDocument;

	/**
	 * Specify an image src instead of infering one from the user's info
	 */
	src?: string;

	/**
	 * Whether or not this profile picture should be a link (default = true)
	 */
	link?: boolean;

	/**
	 * sm = 32px, lg = 128px
	 */
	size?: "sm" | "lg";

	/**
	 * When clicking this this profile, should it take you to a UGPT page?
	 */
	toGPT?: string;
}) {
	const dimensions = size === "sm" ? 32 : 128;
	const props = {
		src: imgUrl ? imgUrl : ToAPIURL(`/users/${user.id}/pfp`),
		alt: `${user.username}'s Profile Picture`,
		height: dimensions,
		width: dimensions,
		className: "d-inline-block object-fit-cover bg-body-tertiary shadow-sm rounded fs-0",
	};
	if (link) {
		return (
			<Link to={`/u/${user.username}/${toGPT}`}>
				<img {...props} />
			</Link>
		);
	}
	return <img {...props} />;
}

import { ToAPIURL } from "util/api";
import React from "react";
import { UserDocument } from "tachi-common";
import { Link } from "react-router-dom";

export default function ProfilePicture({
	user,
	src,
	toGPT = "",
}: {
	user: UserDocument | string;
	src?: string;

	/**
	 * When clicking this this profile, should it take you to a UGPT page?
	 */
	toGPT?: string;
}) {
	if (typeof user === "string") {
		return (
			<Link to={`/u/${user}/${toGPT}`}>
				<img
					src={src ? src : ToAPIURL(`/users/${user}/pfp`)}
					alt={`${user}'s Profile Picture`}
					className="rounded"
					style={{
						width: "128px",
						height: "128px",
						objectFit: "cover",
						boxShadow: "0px 0px 10px 0px #000000",
					}}
				/>
			</Link>
		);
	}

	return (
		<Link to={`/u/${user.username}/${toGPT}`}>
			<img
				src={src ? src : ToAPIURL(`/users/${user.id}/pfp`)}
				alt={`${user.username}'s Profile Picture`}
				className="rounded"
				style={{
					width: "128px",
					height: "128px",
					objectFit: "cover",
					boxShadow: "0px 0px 10px 0px #000000",
				}}
			/>
		</Link>
	);
}

export function ProfilePictureSmall({
	user,
	src,
	toGPT = "",
}: {
	user: UserDocument | string;
	src?: string;

	/**
	 * When clicking this this profile, should it take you to a UGPT page?
	 */
	toGPT?: string;
}) {
	if (typeof user === "string") {
		return (
			<Link to={`/u/${user}/${toGPT}`}>
				<img
					src={src ? src : ToAPIURL(`/users/${user}/pfp`)}
					alt={`${user}'s Profile Picture`}
					className="rounded"
					style={{
						width: "32px",
						height: "32px",
						objectFit: "cover",
						boxShadow: "0px 0px 10px 0px #000000",
					}}
				/>
			</Link>
		);
	}

	return (
		<Link to={`/u/${user.username}/${toGPT}`}>
			<img
				src={src ? src : ToAPIURL(`/users/${user.id}/pfp`)}
				alt={`${user.username}'s Profile Picture`}
				className="rounded"
				style={{
					width: "32px",
					height: "32px",
					objectFit: "cover",
					boxShadow: "0px 0px 10px 0px #000000",
				}}
			/>
		</Link>
	);
}

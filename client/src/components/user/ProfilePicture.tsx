import { ToAPIURL } from "util/api";
import React from "react";
import { UserDocument } from "tachi-common";
import { Link } from "react-router-dom";

export default function ProfilePicture({
	user,
	src,
	toGPT = "",
	className = "",
}: {
	user: UserDocument | string;
	src?: string;
	className?: string;

	/**
	 * When clicking this this profile, should it take you to a UGPT page?
	 */
	toGPT?: string;
}) {
	if (typeof user === "string") {
		return (
			<Link to={`/u/${user}/${toGPT}`} className={className}>
				<img
					src={src ? src : ToAPIURL(`/users/${user}/pfp`)}
					alt={`${user}'s Profile Picture`}
					className="rounded pfp"
				/>
			</Link>
		);
	}

	return (
		<Link to={`/u/${user.username}/${toGPT}`} className={`${className ? `${className}` : ""}`}>
			<img
				src={src ? src : ToAPIURL(`/users/${user.id}/pfp`)}
				alt={`${user.username}'s Profile Picture`}
				className="rounded pfp"
			/>
		</Link>
	);
}

export function SupporterProfilePicture({
	user,
	src,
	toGPT = "",
	className = "",
}: {
	user: UserDocument | string;
	src?: string;
	className?: string;

	/**
	 * When clicking this this profile, should it take you to a UGPT page?
	 */
	toGPT?: string;
}) {
	if (typeof user === "string") {
		return (
			<Link to={`/u/${user}/${toGPT}`} className={className}>
				<img
					src={src ? src : ToAPIURL(`/users/${user}/pfp`)}
					alt={`${user}'s Profile Picture`}
					className="rounded pfp"
				/>
			</Link>
		);
	}

	return (
		<Link to={`/u/${user.username}/${toGPT}`} className={className}>
			<div className="pfp-supporter d-flex align-items-end justify-content-end user-select-none">
				<div className="bg-warning text-dark ps-1 pfp-badge">
					<small>Supporter!</small>
				</div>
			</div>
			<img
				src={src ? src : ToAPIURL(`/users/${user.id}/pfp`)}
				alt={`${user.username}'s Profile Picture`}
				className="rounded pfp"
			/>
		</Link>
	);
}

export function ProfilePictureSmall({
	user,
	src,
	toGPT = "",
	className,
}: {
	user: UserDocument | string;
	src?: string;
	className?: string;
	/**
	 * When clicking this this profile, should it take you to a UGPT page?
	 */
	toGPT?: string;
}) {
	if (toGPT) {
		// eslint-disable-next-line no-param-reassign
		toGPT = `games/${toGPT}`;
	}

	if (typeof user === "string") {
		return (
			<Link to={`/u/${user}/${toGPT}`} className={className}>
				<img
					src={src ? src : ToAPIURL(`/users/${user}/pfp`)}
					alt={`${user}'s Profile Picture`}
					className="rounded pfp-small"
				/>
			</Link>
		);
	}

	return (
		<Link to={`/u/${user.username}/${toGPT}`} className={className}>
			<img
				src={src ? src : ToAPIURL(`/users/${user.id}/pfp`)}
				alt={`${user.username}'s Profile Picture`}
				className="rounded pfp-small"
			/>
		</Link>
	);
}
